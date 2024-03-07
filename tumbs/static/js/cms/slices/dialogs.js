import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "dialogs",
  initialState: {
    visibleDialogId: null,
  },
  reducers: {
    showDialog: (state, { payload: id }) => {
      state.visibleDialogId = id;
    },
    hideDialogs: (state) => {
      state.visibleDialogId = null;
    },
  },
});

export const actions = slice.actions;
export const reducer = slice.reducer;
