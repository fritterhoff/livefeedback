import { ServerConnection } from '@jupyterlab/services';

/**
 * Call the API extension
 *
 * @param endPoint API REST end point for the extension
 * @param init Initial values for the request
 * @returns The response body interpreted as JSON
 */
export async function requestAPI<T>(
  endPoint = '',
  init: RequestInit = {}
): Promise<T> {
  // Make request to Jupyter API
  const settings = ServerConnection.makeSettings();
  const base = process.env.JUPYTERHUB_BASE_URL || '/';
  const requestUrl = base + 'services/Feedback/' + endPoint;

  let response: Response;
  try {
    response = await handleRequest(requestUrl, init, settings);
  } catch (error) {
    throw new ServerConnection.NetworkError(error);
  }

  let data: any = await response.text();

  if (data.length > 0) {
    try {
      data = JSON.parse(data);
    } catch (error) {
      console.log('Not a JSON response body.', response);
    }
  }

  if (!response.ok) {
    throw new ServerConnection.ResponseError(response, data.message || data);
  }

  return data;
}
function handleRequest(
  url: string,
  init: RequestInit,
  settings: ServerConnection.ISettings
): Promise<Response> {
  // Use explicit cache buster when `no-store` is set since
  // not all browsers use it properly.
  const cache = init.cache ?? settings.init.cache;
  if (cache === 'no-store') {
    // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
    url += (/\?/.test(url) ? '&' : '?') + new Date().getTime();
  }

  const request = new settings.Request(url, { ...settings.init, ...init });

  const token = process.env.JUPYTERHUB_API_TOKEN || '';
  // Handle authentication. Authentication can be overdetermined by
  // settings token and XSRF token.
  let authenticated = false;
  if (token) {
    authenticated = true;
    request.headers.append('Authorization', `token ${token}`);
  }
  if (typeof document !== 'undefined' && document?.cookie) {
    const xsrfToken = getCookie('_xsrf');
    if (xsrfToken !== undefined) {
      authenticated = true;
      request.headers.append('X-XSRFToken', xsrfToken);
    }
  }

  // Set the content type if there is no given data and we are
  // using an authenticated connection.
  if (!request.headers.has('Content-Type') && authenticated) {
    request.headers.set('Content-Type', 'application/json');
  }

  // Use `call` to avoid a `TypeError` in the browser.
  return settings.fetch.call(null, request).catch((e: TypeError) => {
    // Convert the TypeError into a more specific error.
    throw new ServerConnection.NetworkError(e);
  });
  // TODO: *this* is probably where we need a system-wide connectionFailure
  // signal we can hook into.
}

/**
 * Get a cookie from the document.
 */
function getCookie(name: string): string | undefined {
  // From http://www.tornadoweb.org/en/stable/guide/security.html
  const matches = document.cookie.match('\\b' + name + '=([^;]*)\\b');
  return matches?.[1];
}
