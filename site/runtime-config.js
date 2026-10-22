/* Runtime API routing. Same-origin Render stays relative; Cloudflare Pages uses the Render API automatically. */
(() => {
  const host = String(location.hostname || '').toLowerCase();
  const sameOrigin = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.onrender.com');
  window.__MF_API_ORIGIN__ = sameOrigin ? '' : 'https://modmendryx-api.onrender.com';
})();
// Optional fixed URL of the heavy-file node. Normally Render announces it via /api/health (see LOCAL-NODE.md).
window.__MF_LOCAL_ORIGIN__ = '';
