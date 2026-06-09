async function googleTTS(text, lang) {
  const url =
    "https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&ttsspeed=0.9" +
    "&tl=" + lang +
    "&q=" + encodeURIComponent(text);
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(5000)
  });
  if (!res.ok) throw new Error("status " + res.status);
  return res.arrayBuffer();
}

export async function onRequest(context) {
  const { request } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS"
      }
    });
  }

  const text = new URL(request.url).searchParams.get("text");
  if (!text) return new Response("Missing text", { status: 400 });

  const lang = "ja";

  try {
    const audio = await googleTTS(text, lang);
    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err) {
    console.error("[TTS]", err);
    return new Response("TTS error", { status: 502 });
  }
}
