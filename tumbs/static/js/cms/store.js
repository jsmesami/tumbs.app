import { configureStore } from "@reduxjs/toolkit";
import { reducer as alertsReducer } from "./slices/alerts";
import { reducer as newWebsiteReducer } from "./slices/newWebsiteModal";
import { reducer as websitesReducer } from "./slices/websites";

const container = document.getElementById("cms");
const initData = JSON.parse(container.dataset.init);

export const LANGUAGES = initData.languages;
export const REGIONS = initData.regions;
export const ENDPOINTS = initData.endpoints;

export default configureStore({
  reducer: {
    alerts: alertsReducer,
    newWebsiteModal: newWebsiteReducer,
    websites: websitesReducer,
  },
});
