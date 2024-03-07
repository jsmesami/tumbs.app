import { createSlice } from "@reduxjs/toolkit";
import { INIT } from "../config";

export const slice = createSlice({
  name: "websites",
  initialState: {
    available: INIT.websites,
    currentId: INIT.websites[INIT.websites.length - 1]?.id,
  },
  reducers: {
    addWebsite: (state, { payload: ws }) => {
      state.available.push(ws);
    },
    updateWebsite: (state, { payload: ws }) => {
      const idx = state.available.findIndex((item) => item.id === ws.id);
      if (idx >= 0) {
        state.available[idx] = ws;
      } else {
        state.available.push(ws);
      }
      state.currentId = ws.id;
    },
    setCurrent: (state, { payload: id }) => {
      const current = state.available.find((item) => item.id === id);
      if (current) {
        state.currentId = current.id;
      }
    },
  },
  selectors: {
    selectCurrent: (state) => {
      return state.available.find((item) => item.id === state.currentId);
    },
  },
});

export const actions = slice.actions;
export const reducer = slice.reducer;
export const selectors = slice.selectors;
