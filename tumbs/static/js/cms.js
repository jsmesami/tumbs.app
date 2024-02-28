import React from "react";
import { createRoot } from "react-dom/client";
import App from "./cms/components/App";

const container = document.getElementById("cms");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App init={JSON.parse(container.dataset.init)} />
  </React.StrictMode>,
);
