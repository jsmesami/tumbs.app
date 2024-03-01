import { createSlice } from "@reduxjs/toolkit";
import * as R from "ramda";

const container = document.getElementById("cms");
const initData = JSON.parse(container.dataset.init);

export const slice = createSlice({
  name: "websites",
  initialState: {
    available: initData.websites,
    current: R.last(initData.websites),
  },
  reducers: {
    addWebsite: (state, { payload }) => {
      state.available.push(payload);
    },
    setCurrent: (state, { payload }) => {
      state.current = R.find(R.propEq(payload, "id"))(state.available);
    },
  },
});

export const actions = slice.actions;
export const reducer = slice.reducer;
