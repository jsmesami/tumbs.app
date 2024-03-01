import { configureStore } from "@reduxjs/toolkit";
import { reducer as websitesReducer } from "./slices/websites";
import { reducer as newWebsiteReducer } from "./slices/newWebsiteModal";

const container = document.getElementById("cms");
const initData = JSON.parse(container.dataset.init);

export const LANGUAGES = initData.languages;
export const REGIONS = initData.regions;
export const ENDPOINTS = initData.endpoints;

export default configureStore({
  reducer: {
    websites: websitesReducer,
    newWebsiteModal: newWebsiteReducer,
  },
});
