const https = require("https");

exports.handler = async (event) => {
  const text = event.queryStringParameters && event.queryStringParameters.text;
  if (!text) return { statusCode: 400, body: "Missing text" };

  const lang = /[぀-ヿㇰ-ㇿ]/.test(text) ? "ja" : "zh-CN";
  const url =
    "https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&ttsspeed=0.9" +
    "&tl=" + lang +
    "&q=" + encodeURIComponent(text);

  return new Promise((resolve) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        resolve({
          statusCode: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=86400",
          },
          body: Buffer.concat(chunks).toString("base64"),
          isBase64Encoded: true,
        });
      });
    }).on("error", () => resolve({ statusCode: 502, body: "error" }));
  });
};
