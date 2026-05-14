 const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SITE_URL =
  process.env.SITE_URL || "https://venerable-pavlova-6bcd56.netlify.app";

const PRODUCTS = {
  WORD_LIMIT_10: {
    priceId: "price_1TWUHEJwEImJY61ci4uFqSpj",
    productCode: "WORD_LIMIT_10",
    wordLimitBonus: 10,
    aiQuota: 0,
    unlimitedDays: 0,
  },
  WORD_LIMIT_50: {
    priceId: "price_1TWZQpJwEImJY61cHRzXR3t",
    productCode: "WORD_LIMIT_50",
    wordLimitBonus: 50,
    aiQuota: 0,
    unlimitedDays: 0,
  },
  WORD_LIMIT_100: {
    priceId: "price_1TWZReJwEImJY61cdrztMzYB",
    productCode: "WORD_LIMIT_100",
    wordLimitBonus: 100,
    aiQuota: 0,
    unlimitedDays: 0,
  },
  WORD_LIMIT_500: {
    priceId: "price_1TWZT9JwEImJY61cZ2TBDgu3",
    productCode: "WORD_LIMIT_500",
    wordLimitBonus: 500,
    aiQuota: 0,
    unlimitedDays: 0,
  },
  WORD_LIMIT_UNLIMITED_30D: {
    priceId: "price_1TWZWcJwEImJY61cVOZemJg7",
    productCode: "WORD_LIMIT_UNLIMITED_30D",
    wordLimitBonus: 0,
    aiQuota: 0,
    unlimitedDays: 30,
  },
  AI_QUOTA_5: {
    priceId: "price_1TWZZbJwEImJY61ctCRgERaL",
    productCode: "AI_QUOTA_5",
    wordLimitBonus: 0,
    aiQuota: 5,
    unlimitedDays: 0,
  },
  AI_QUOTA_100: {
    priceId: "price_1TWZbwJwEImJY61cDxj5VKpm",
    productCode: "AI_QUOTA_100",
    wordLimitBonus: 0,
    aiQuota: 100,
    unlimitedDays: 0,
  },
};

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function findProduct(body) {
  if (body.productCode && PRODUCTS[body.productCode]) {
    return PRODUCTS[body.productCode];
  }

  if (body.priceId) {
    return Object.values(PRODUCTS).find((p) => p.priceId === body.priceId);
  }

  return null;
}

exports.handler = async function (event) {
  try {
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true }),
      };
    }

    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: "Method not allowed" }),
      };
    }

    let body = {};
    try {
      body = JSON.parse(event.body || "{}");
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "请求数据格式错误。" }),
      };
    }

    const authHeader =
      event.headers.authorization ||
      event.headers.Authorization ||
      "";

    const tokenFromHeader = authHeader.replace(/^Bearer\s+/i, "").trim();
    const tokenFromBody = String(body.access_token || body.token || "").trim();
    const token = tokenFromHeader || tokenFromBody;

    if (!token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          error: "请先登录账号后再购买。",
          debug: "missing_token",
        }),
      };
    }

    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData || !userData.user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          error: "登录状态无效，请重新登录。",
          debug: userError ? userError.message : "no_user",
        }),
      };
    }

    const user = userData.user;
    const product = findProduct(body);

    if (!product) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "商品不存在。",
          received: {
            productCode: body.productCode || null,
            priceId: body.priceId || null,
          },
        }),
      };
    }

    const successUrl =
      body.successUrl || `${SITE_URL}?checkout=success`;
    const cancelUrl =
      body.cancelUrl || `${SITE_URL}?checkout=cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: product.priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email || undefined,
      metadata: {
        user_id: user.id,
        user_email: user.email || "",
        product_code: product.productCode,
        price_id: product.priceId,
        word_limit_bonus: String(product.wordLimitBonus),
        ai_quota: String(product.aiQuota),
        unlimited_days: String(product.unlimitedDays),
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        url: session.url,
      }),
    };
  } catch (error) {
    console.error("create-checkout-session error:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || "创建支付页面失败。",
      }),
    };
  }
};
