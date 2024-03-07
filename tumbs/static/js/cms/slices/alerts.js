import { createSlice } from "@reduxjs/toolkit";
import hash from "object-hash";

export const slice = createSlice({
  name: "alerts",
  initialState: {
    list: [],
  },
  reducers: {
    addAlert: (state, { payload }) => {
      const id = hash.MD5(payload);
      const exists = state.list.find((item) => item.id === id);
      if (!exists) {
        state.list.push({ id: id, ...payload });
      }
    },
    removeAlert: (state, { payload: id }) => {
      state.list = state.list.filter((item) => item.id !== id);
    },
    removeAll: (state) => {
      state.list = [];
    },
  },
});

export const actions = slice.actions;
export const reducer = slice.reducer;
