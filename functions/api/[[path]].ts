type Env = { RELAY_API_ORIGIN?: string };

export async function onRequest(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const origin = context.env.RELAY_API_ORIGIN;
  if (!origin) {
    return new Response("API origin is not configured", { status: 500 });
  }
  const incoming = new URL(context.request.url);
  const target = new URL(incoming.pathname + incoming.search, origin);
  return fetch(new Request(target.toString(), context.request));
}