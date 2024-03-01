import { ENDPOINTS } from "./store";

export const request = (endpoint, { payload = {}, onSuccess = null, onError = null }) => {
  const { uri, method } = ENDPOINTS[endpoint];
  fetch(uri, {
    method: method,
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) return response.json();

      onError && onError(`${response.status} ${response.statusText}`);
      return Promise.reject(response);
    })
    .then((data) => {
      onSuccess && onSuccess(data);
    })
    .catch((err) => {
      onError && onError(err);
    });
};
