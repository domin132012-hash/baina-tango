 const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
);

// 你的 7 个商品价格 ID 对应的权益
const PRICE_MAP = {
  "price_1TWUHEJwEImJY61ci4uFqSpj": {
    product_code: "WORD_LIMIT_10",
    word_limit_bonus: 10,
    ai_quota: 0,
    unlimited_days: 0
  },

  "price_1TWZQpJwEImJY61cHRzXR3t": {
    product_code: "WORD_LIMIT_50",
    word_limit_bonus: 50,
    ai_quota: 0,
    unlimited_days: 0
  },

  "price_1TWZReJwEImJY61cdrztMzYB": {
    product_code: "WORD_LIMIT_100",
    word_limit_bonus: 100,
    ai_quota: 0,
    unlimited_days: 0
  },

  "price_1TWZT9JwEImJY61cZ2TBDgu3": {
    product_code: "WORD_LIMIT_500",
    word_limit_bonus: 500,
    ai_quota: 0,
    unlimited_days: 0
  },

  "price_1TWZWcJwEImJY61cVOZemJg7": {
    product_code: "WORD_LIMIT_UNLIMITED_30D",
    word_limit_bonus: 0,
    ai_quota: 0,
    unlimited_days: 30
  },

  "price_1TWZZbJwEImJY61ctCRgERaL": {
    product_code: "AI_QUOTA_5",
    word_limit_bonus: 0,
    ai_quota: 5,
    unlimited_days: 0
  },

  "price_1TWZbwJwEImJY61cDxj5VKpm": {
    product_code: "AI_QUOTA_100",
    word_limit_bonus: 0,
    ai_quota: 100,
    unlimited_days: 0
  }
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + Number(days || 0));
  return d.toISOString();
}

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const signature =
    event.headers["stripe-signature"] || event.headers["Stripe-Signature"];

  let stripeEvent;

  try {
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body;

    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return json(400, { error: "Webhook signature verification failed" });
  }

  try {
    if (stripeEvent.type !== "checkout.session.completed") {
      return json(200, { received: true, ignored: stripeEvent.type });
    }

    const session = stripeEvent.data.object;

    const userId =
      session.metadata?.user_id ||
      session.metadata?.userId ||
      session.client_reference_id;

    let priceId = session.metadata?.price_id || session.metadata?.priceId;

    // 如果 metadata 里没有 price_id，就从 Stripe Session 里重新取 line_items
    if (!priceId) {
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items.data.price"]
      });

      priceId =
        fullSession.line_items &&
        fullSession.line_items.data &&
        fullSession.line_items.data[0] &&
        fullSession.line_items.data[0].price
          ? fullSession.line_items.data[0].price.id
          : "";
    }

    if (!userId) {
      console.error("Missing userId in checkout session metadata:", session.id);
      return json(400, { error: "Missing userId" });
    }

    if (!priceId) {
      console.error("Missing priceId in checkout session:", session.id);
      return json(400, { error: "Missing priceId" });
    }

    const product = PRICE_MAP[priceId];

    if (!product) {
      console.error("Unknown priceId:", priceId);
      return json(400, { error: "Unknown priceId: " + priceId });
    }

    const amountTotal = Number(session.amount_total || 0);
    const currency = String(session.currency || "jpy").toLowerCase();

    // 1. 先读取当前权益
    const { data: oldEntitlement, error: readError } = await supabaseAdmin
      .from("user_entitlements")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (readError) {
      console.error("Read entitlement error:", readError);
      return json(500, { error: "Read entitlement failed" });
    }

    const oldWordBonus = Number(oldEntitlement?.word_limit_bonus || 0);
    const oldAiQuota = Number(oldEntitlement?.ai_quota || 0);

    let newUnlimitedUntil =
      oldEntitlement?.unlimited_until ||
      oldEntitlement?.premium_until ||
      null;

    // 无限词库 30 天：如果原来还没过期，就从原到期日继续加；如果已经过期，就从现在开始加
    if (product.unlimited_days > 0) {
      const now = new Date();
      const oldTime = newUnlimitedUntil
        ? new Date(newUnlimitedUntil).getTime()
        : 0;

      const baseDate = oldTime > now.getTime() ? new Date(oldTime) : now;
      newUnlimitedUntil = addDays(baseDate, product.unlimited_days);
    }

    // 2. 更新用户权益
    const { error: entitlementError } = await supabaseAdmin
      .from("user_entitlements")
      .upsert(
        {
          user_id: userId,
          word_limit_bonus: oldWordBonus + Number(product.word_limit_bonus || 0),
          ai_quota: oldAiQuota + Number(product.ai_quota || 0),
          unlimited_until: newUnlimitedUntil,
          premium_until: newUnlimitedUntil,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: "user_id"
        }
      );

    if (entitlementError) {
      console.error("Update entitlement error:", entitlementError);
      return json(500, { error: "Update entitlement failed" });
    }

    // 3. 写入购买记录
    const { error: orderError } = await supabaseAdmin
      .from("payment_orders")
      .upsert(
        {
          user_id: userId,
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent || null,
          product_code: product.product_code,
          price_id: priceId,
          amount_jpy: currency === "jpy" ? amountTotal : 0,
          amount_cny: currency === "cny" ? Math.round(amountTotal / 100) : 0,
          currency: currency,
          status: "paid",
          paid_at: new Date().toISOString()
        },
        {
          onConflict: "stripe_session_id"
        }
      );

    if (orderError) {
      console.error("Insert payment order error:", orderError);
      return json(500, { error: "Insert payment order failed" });
    }

    console.log("Payment processed:", {
      userId,
      priceId,
      productCode: product.product_code,
      sessionId: session.id
    });

    return json(200, {
      received: true,
      userId,
      priceId,
      productCode: product.product_code
    });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return json(500, { error: err.message || "Webhook handler failed" });
  }
};
