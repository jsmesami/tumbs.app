import * as R from "ramda";
import { ENDPOINTS } from "./store";

export const apiRequest = (endpoint, { args = {}, payload = {}, init = {} }) => {
  const { uri, method } = ENDPOINTS[endpoint];

  return fetch(
    uri.supplant(args),
    R.mergeRight(
      {
        method: method,
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      },
      init,
    ),
  ).then((response) => {
    if (response.ok) return response.json();
    return Promise.reject(response.statusText);
  });
};
