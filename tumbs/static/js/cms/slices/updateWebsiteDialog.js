import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "updateWebsiteDialog",
  initialState: {
    visible: false,
  },
  reducers: {
    show: (state) => {
      state.visible = true;
    },
    hide: (state) => {
      state.visible = false;
    },
  },
});

export const actions = slice.actions;
export const reducer = slice.reducer;
