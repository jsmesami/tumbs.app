import { createSlice } from "@reduxjs/toolkit";

const container = document.getElementById("cms");
const initData = JSON.parse(container.dataset.init);

export const slice = createSlice({
  name: "websites",
  initialState: {
    available: initData.websites,
    current: initData.websites.slice(-1),
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
      state.current = ws;
    },
    setCurrent: (state, { payload: id }) => {
      const current = state.available.find((item) => item.id === id);
      if (current) {
        state.current = current;
      }
    },
  },
});

export const actions = slice.actions;
export const reducer = slice.reducer;
