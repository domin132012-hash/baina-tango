const https = require("https");

function googleTTS(text, lang) {
  return new Promise((resolve, reject) => {
    const url =
      "https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&ttsspeed=0.9" +
      "&tl=" + lang +
      "&q=" + encodeURIComponent(text);
    const req = https.get(url, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 5000 }, (res) => {
      if (res.statusCode !== 200) return reject(new Error("status " + res.statusCode));
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
  });
}

async function microsoftTTS(text) {
  const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");
  const tts = new MsEdgeTTS();
  await tts.setMetadata("ja-JP-NanamiNeural", OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = await tts.toStream(text);
  const chunks = [];
  await new Promise((resolve, reject) => {
    audioStream.on("data", (c) => chunks.push(Buffer.from(c)));
    audioStream.on("end", resolve);
    audioStream.on("error", reject);
  });
  return Buffer.concat(chunks);
}

exports.handler = async (event) => {
  const text = event.queryStringParameters && event.queryStringParameters.text;
  if (!text) return { statusCode: 400, body: "Missing text" };

  const lang = /[぀-ヿ]/.test(text) ? "ja" : "zh-CN";

  let audio;
  try {
    audio = await googleTTS(text, lang);
  } catch (_) {
    try {
      audio = await microsoftTTS(text);
    } catch (err) {
      console.error("[TTS]", err);
      return { statusCode: 502, body: "TTS error" };
    }
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400",
    },
    body: audio.toString("base64"),
    isBase64Encoded: true,
  };
};
