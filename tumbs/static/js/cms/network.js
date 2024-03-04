import * as R from "ramda";
import { ENDPOINTS } from "./store";

const interpolate = (str, o) => {
  return str.replace(/{([^{}]*)}/g, function (a, b) {
    const r = o[b];
    return typeof r === "string" || typeof r === "number" ? r : a;
  });
};

export const apiRequest = (endpoint, { args = {}, payload = {}, init = {} }) => {
  const { uri, method } = ENDPOINTS[endpoint];

  return fetch(
    interpolate(uri, args),
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
