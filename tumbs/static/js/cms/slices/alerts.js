import { createSlice } from "@reduxjs/toolkit";
import hash from "object-hash";

const slice = createSlice({
  name: "alerts",
  initialState: {
    all: [],
  },
  reducers: {
    addAlert: (state, { payload }) => {
      const id = hash.MD5(payload);
      const exists = state.all.find((item) => item.id === id);
      if (!exists) {
        state.all.push({ id: id, ...payload });
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
