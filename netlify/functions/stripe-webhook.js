const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function parseIntSafe(value) {
  const n = parseInt(String(value || "0"), 10);
  return Number.isFinite(n) ? n : 0;
}

function addDaysToDate(baseDate, days) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method not allowed"
    };
  }

  const signature =
    event.headers["stripe-signature"] ||
    event.headers["Stripe-Signature"];

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return {
      statusCode: 500,
      body: "Missing STRIPE_WEBHOOK_SECRET"
    };
  }

  let rawBody = event.body || "";

  if (event.isBase64Encoded) {
    rawBody = Buffer.from(rawBody, "base64");
  }

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
  } catch (err) {
    return {
      statusCode: 400,
      body: `Webhook signature verification failed: ${err.message}`
    };
  }

  if (stripeEvent.type !== "checkout.session.completed") {
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true, ignored: stripeEvent.type })
    };
  }

  const session = stripeEvent.data.object;

  if (session.payment_status !== "paid") {
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true, unpaid: true })
    };
  }

  const metadata = session.metadata || {};

  const userId = metadata.user_id;
  const productCode = metadata.product_code || "";
  const priceId = metadata.price_id || "";
  const wordLimitBonus = parseIntSafe(metadata.word_limit_bonus);
  const aiQuota = parseIntSafe(metadata.ai_quota);
  const unlimitedDays = parseIntSafe(metadata.unlimited_days);

  if (!userId) {
    return {
      statusCode: 400,
      body: "Missing user_id in metadata"
    };
  }

  // 先记录支付事件，防止 Stripe 重复通知导致重复发货
  const { error: eventInsertError } = await supabase
    .from("payment_events")
    .insert({
      stripe_event_id: stripeEvent.id,
      stripe_checkout_session_id: session.id,
      user_id: userId,
      price_id: priceId,
      product_code: productCode,
      word_limit_bonus: wordLimitBonus,
      ai_quota: aiQuota,
      unlimited_days: unlimitedDays,
      amount_total: session.amount_total || 0,
      currency: session.currency || "jpy",
      status: "processed",
      raw_event: stripeEvent,
      created_at: new Date().toISOString()
    });

  if (eventInsertError) {
    // 23505 = unique 冲突，说明这笔付款已经处理过
    if (eventInsertError.code === "23505") {
      return {
        statusCode: 200,
        body: JSON.stringify({ received: true, duplicate: true })
      };
    }

    return {
      statusCode: 500,
      body: `Failed to insert payment event: ${eventInsertError.message}`
    };
  }

  const { data: current, error: readError } = await supabase
    .from("user_entitlements")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) {
    return {
      statusCode: 500,
      body: `Failed to read entitlements: ${readError.message}`
    };
  }

  const now = new Date();
  let unlimitedUntil = current && current.unlimited_until
    ? current.unlimited_until
    : null;

  if (unlimitedDays > 0) {
    const currentUnlimitedDate = unlimitedUntil ? new Date(unlimitedUntil) : null;
    const baseDate =
      currentUnlimitedDate && currentUnlimitedDate > now
        ? currentUnlimitedDate
        : now;

    unlimitedUntil = addDaysToDate(baseDate, unlimitedDays);
  }

  const nextWordLimitBonus =
    parseIntSafe(current && current.word_limit_bonus) + wordLimitBonus;

  const nextAiQuota =
    parseIntSafe(current && current.ai_quota) + aiQuota;

  const { error: upsertError } = await supabase
    .from("user_entitlements")
    .upsert(
      {
        user_id: userId,
        word_limit_bonus: nextWordLimitBonus,
        ai_quota: nextAiQuota,
        unlimited_until: unlimitedUntil,
        updated_at: now.toISOString()
      },
      {
        onConflict: "user_id"
      }
    );

  if (upsertError) {
    return {
      statusCode: 500,
      body: `Failed to update entitlements: ${upsertError.message}`
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      received: true,
      userId,
      productCode,
      wordLimitBonus,
      aiQuota,
      unlimitedDays
    })
  };
};
