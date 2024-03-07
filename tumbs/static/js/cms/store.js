import { configureStore } from "@reduxjs/toolkit";
import { reducer as alertsReducer } from "./slices/alerts";
import { reducer as updateWebsiteReducer } from "./slices/updateWebsiteDialog";
import { reducer as websitesReducer } from "./slices/websites";

export default configureStore({
  reducer: {
    alerts: alertsReducer,
    updateWebsiteDialog: updateWebsiteReducer,
    websites: websitesReducer,
  },
});
