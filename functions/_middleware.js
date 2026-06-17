const TAG_OPEN = '<scr' + 'ipt src="';
const TAG_CLOSE = '"></scr' + 'ipt>';
const NOTICES_SCRIPT = TAG_OPEN + '/assets/notices.js?v=20260614-notices-kv' + TAG_CLOSE;
const EJU_ESSAY_SCRIPT = TAG_OPEN + '/assets/eju-essay.js?v=20260615-eju-essay-v4-entry-open' + TAG_CLOSE;
const INJECTED_SCRIPTS = NOTICES_SCRIPT + '\n' + EJU_ESSAY_SCRIPT;

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
        element.append('\n' + INJECTED_SCRIPTS + '\n', { html: true });
      }
    })
    .transform(response);
}
