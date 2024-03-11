import { configureStore } from "@reduxjs/toolkit";
import { reducer as alertsReducer } from "./slices/alerts";
import { reducer as dialogsReducer } from "./slices/dialogs";
import { reducer as pagesReducer } from "./slices/pages";
import { reducer as stashReducer } from "./slices/stash";

export default configureStore({
  reducer: {
    alerts: alertsReducer,
    dialogs: dialogsReducer,
    pages: pagesReducer,
    stash: stashReducer,
  },
});
