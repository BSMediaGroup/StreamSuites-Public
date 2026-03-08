export async function onRequest(context) {
  const url = new URL(context.request.url);
  url.pathname = "/u/index.html";
  const assetRequest = new Request(url.toString(), {
    method: context.request.method === "HEAD" ? "HEAD" : "GET",
    headers: context.request.headers
  });
  return context.env.ASSETS.fetch(assetRequest);
}
