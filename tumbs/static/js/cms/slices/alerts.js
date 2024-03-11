import { createSlice } from "@reduxjs/toolkit";
import hash from "object-hash";

const slice = createSlice({
  name: "alerts",
  initialState: {
    all: [],
  },
  reducers: {
    addAlert: (state, { payload: alert }) => {
      const id = hash.MD5(alert);
      const exists = state.all.find((item) => item.id === id);
      if (!exists) {
        state.all.push({ id: id, ...alert });
      }
    },
    removeAlert: (state, { payload: id }) => {
      state.all = state.all.filter((item) => item.id !== id);
    },
    removeAll: (state) => {
      state.all = [];
    },
  },
});

export const actions = slice.actions;
export const reducer = slice.reducer;
