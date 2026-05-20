import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const PRODUCTS = {
  WORD_LIMIT_10: { priceId: "price_1TWUHEJwEImJY61ci4uFqSpj", productCode: "WORD_LIMIT_10", wordLimitBonus: 10, aiQuota: 0, unlimitedDays: 0 },
  WORD_LIMIT_50: { priceId: "price_1TWZQpJwEImJY61cHRzXR3t", productCode: "WORD_LIMIT_50", wordLimitBonus: 50, aiQuota: 0, unlimitedDays: 0 },
  WORD_LIMIT_100: { priceId: "price_1TWZReJwEImJY61cdrztMzYB", productCode: "WORD_LIMIT_100", wordLimitBonus: 100, aiQuota: 0, unlimitedDays: 0 },
  WORD_LIMIT_500: { priceId: "price_1TWZT9JwEImJY61cZ2TBDgu3", productCode: "WORD_LIMIT_500", wordLimitBonus: 500, aiQuota: 0, unlimitedDays: 0 },
  WORD_LIMIT_UNLIMITED_30D: { priceId: "price_1TWZWcJwEImJY61cVOZemJg7", productCode: "WORD_LIMIT_UNLIMITED_30D", wordLimitBonus: 0, aiQuota: 0, unlimitedDays: 30 },
  AI_QUOTA_5: { priceId: "price_1TWZZbJwEImJY61ctCRgERaL", productCode: "AI_QUOTA_5", wordLimitBonus: 0, aiQuota: 5, unlimitedDays: 0 },
  AI_QUOTA_100: { priceId: "price_1TWZbwJwEImJY61cDxj5VKpm", productCode: "AI_QUOTA_100", wordLimitBonus: 0, aiQuota: 100, unlimitedDays: 0 }
};

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    }
  });
}

function findProduct(body) {
  if (body.productCode && PRODUCTS[body.productCode]) return PRODUCTS[body.productCode];
  if (body.priceId) return Object.values(PRODUCTS).find((p) => p.priceId === body.priceId);
  return null;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") return json(200, { ok: true });
  if (request.method !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY);
    const SITE_URL = env.SITE_URL || "https://venerable-pavlova-6bcd56.netlify.app";

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return json(400, { error: "请求数据格式错误。" });
    }

    const auth = request.headers.get("authorization") || "";
    const tokenFromHeader = auth.replace(/^Bearer\s+/i, "").trim();
    const tokenFromBody = String(body.access_token || body.token || "").trim();
    const token = tokenFromHeader || tokenFromBody;

    if (!token) return json(401, { error: "请先登录账号后再购买。", debug: "missing_token" });

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return json(401, { error: "登录状态无效，请重新登录。", debug: userError?.message || "no_user" });
    }

    const user = userData.user;
    const product = findProduct(body);

    if (!product) {
      return json(400, { error: "商品不存在。", received: { productCode: body.productCode || null, priceId: body.priceId || null } });
    }

    const successUrl = body.successUrl || `${SITE_URL}?checkout=success`;
    const cancelUrl = body.cancelUrl || `${SITE_URL}?checkout=cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: product.priceId, quantity: 1 }],
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
        unlimited_days: String(product.unlimitedDays)
      }
    });

    return json(200, { url: session.url });
  } catch (error) {
    console.error("create-checkout-session error:", error);
    return json(500, { error: error.message || "创建支付页面失败。" });
  }
}
