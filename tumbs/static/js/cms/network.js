import { INIT } from "./config";

export const apiRequest = (endpoint, { args = {}, payload = {}, params = {} }) => {
  const { uri, method } = INIT.endpoints[endpoint];
  const init = {
    method: method,
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  };
  return fetch(uri.supplant(args), {
    ...init,
    ...params,
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response.statusText);
  });
};
