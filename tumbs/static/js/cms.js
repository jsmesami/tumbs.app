import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { appContainer } from "./cms/config";
import store from "./cms/store";
import App from "./cms/App";

const root = createRoot(appContainer);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
