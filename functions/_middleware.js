const NOTICES_SCRIPT = '<script src="/assets/notices.js?v=20260614-notices-kv"></script>';

function shouldInject(request, response) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) return false;
  if (url.pathname.startsWith('/assets/')) return false;
  const type = response.headers.get('content-type') || '';
  return type.includes('text/html');
}

export async function onRequest(context) {
  const response = await context.next();
  if (!shouldInject(context.request, response)) return response;
  return new HTMLRewriter()
    .on('body', {
      element(element) {
        element.append('\n' + NOTICES_SCRIPT + '\n', { html: true });
      }
    })
    .transform(response);
}
