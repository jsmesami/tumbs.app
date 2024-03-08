import { INIT } from "./config";

export const apiService = {
  request: (endpointId, { args = {}, payload = {}, additionalParams = {} }) => {
    const { uri, method } = INIT.endpoints[endpointId];
    const defaultHeaders = {
      "Content-Type": "application/json",
    };
    const params = {
      method,
      headers: defaultHeaders,
      body: JSON.stringify(payload),
      ...additionalParams,
    };
    return fetch(uri.supplant(args), params).then((resp) => (resp.ok ? resp.json() : Promise.reject(resp.statusText)));
  },
};
