import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "pages",
  initialState: {
    currentId: null,
  },
  reducers: {
    setCurrentId: (state, { payload: id }) => {
      state.currentId = id;
    },
  },
});

export const actions = slice.actions;
export const reducer = slice.reducer;
