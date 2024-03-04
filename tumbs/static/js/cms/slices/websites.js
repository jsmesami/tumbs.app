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
    addWebsite: (state, { payload: ws }) => {
      state.available.push(ws);
    },
    updateWebsite: (state, { payload: ws }) => {
      const idx = R.findIndex(R.propEq(ws.id, "id"))(state.available);
      if (idx >= 0) state.available[idx] = ws;
      else state.available.push(ws);
      state.current = ws;
    },
    setCurrent: (state, { payload: id }) => {
      state.current = R.find(R.propEq(id, "id"))(state.available);
    },
  },
});

export const actions = slice.actions;
export const reducer = slice.reducer;
