import koaProxy from "koa-proxy";

const HTTP_STATUS_CODE_OK = 200;

export function koaMiddleware(dispatcher, options = {}, proxy = koaProxy) {
  return async function middleware(ctx, next) {
    const { method, path, headers, body, query } = ctx.request;

    if (options.proxyEnabled && options.proxyUrl) {
      return proxy({ host: options.proxyUrl })(ctx, next);
    }

    const response = await dispatcher.request({
      method,
      path,
      headers,
      body,
      query,
      req: ctx.req,
    });

    /* eslint-disable require-atomic-updates */
    ctx.body = response.body;
    ctx.status = response.status ?? HTTP_STATUS_CODE_OK;

    if (!!response.headers) {
      Object.entries(response.headers)
        .forEach(([hkey, hval]) => ctx.set(hkey, hval));
    }
    /* eslint-enable require-atomic-updates */

    return undefined;
  };
}
