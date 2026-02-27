export async function register() {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (!proxyUrl) return;

  const { ProxyAgent, fetch: undiciFetch } = await import("undici");
  const dispatcher = new ProxyAgent(proxyUrl);
  const noProxy = (process.env.NO_PROXY || "").split(",").map((s) => s.trim());

  const shouldProxy = (url: string) => {
    try {
      const { hostname } = new URL(url);
      return !noProxy.some(
        (np) => hostname === np || hostname.endsWith(`.${np}`)
      );
    } catch {
      return false;
    }
  };

  const originalFetch = globalThis.fetch;
  // @ts-expect-error -- dispatcher is not in the standard RequestInit type
  globalThis.fetch = (input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    if (shouldProxy(url)) {
      return undiciFetch(input as Parameters<typeof undiciFetch>[0], {
        ...init,
        dispatcher,
      } as Parameters<typeof undiciFetch>[1]);
    }
    return originalFetch(input, init);
  };
}
