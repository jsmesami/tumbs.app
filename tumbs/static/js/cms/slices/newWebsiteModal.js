import { createSlice } from "@reduxjs/toolkit";

export const slice = createSlice({
  name: "newWebsiteModal",
  initialState: {
    visible: false,
  },
  reducers: {
    showModal: (state) => {
      state.visible = true;
    },
    hideModal: (state) => {
      state.visible = false;
    },
  },
});

export const actions = slice.actions;
export const reducer = slice.reducer;
