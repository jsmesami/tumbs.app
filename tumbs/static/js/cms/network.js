import { INIT } from "./config";

const extractMessage = async (err) => {
  switch (err.status) {
    case 422: {
      const body = await err.json();
      return body.detail.map((d) => d.msg).join(", ");
    }
    default:
      return err.statusText;
  }
};

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
    return fetch(uri.supplant(args), params)
      .then((resp) => (resp.ok ? resp.json() : extractMessage(resp).then((err) => Promise.reject(err))))
      .catch((err) => Promise.reject(String(err)));
  },
};
