import { configureStore } from "@reduxjs/toolkit";
import { reducer as alertsReducer } from "./slices/alerts";
import { reducer as stashReducer } from "./slices/stash";
import { reducer as updateWebsiteReducer } from "./slices/updateWebsiteDialog";

export default configureStore({
  reducer: {
    alerts: alertsReducer,
    stash: stashReducer,
    updateWebsiteDialog: updateWebsiteReducer,
  },
});
