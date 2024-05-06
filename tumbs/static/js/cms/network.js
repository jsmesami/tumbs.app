import { INIT } from "./config";

const extractMessage = async (err) => {
  switch (err.status) {
    case 400: {
      const body = await err.json();
      return body.errors.map((e) => e.detail).join(", ");
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
      .then((resp) => {
        if (resp.ok) {
          // Http 204 "No Content" (ie. deletion) has no content:
          return resp.status === 204 ? null : resp.json();
        }
        return extractMessage(resp).then((err) => Promise.reject(err));
      })
      .catch((err) => Promise.reject(String(err)));
  },
};
