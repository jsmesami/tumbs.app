import { createSlice } from "@reduxjs/toolkit";
import * as R from "ramda";
import hash from "object-hash";

export const slice = createSlice({
  name: "alerts",
  initialState: {
    list: [],
  },
  reducers: {
    addAlert: (state, { payload }) => {
      const id = hash.MD5(payload);
      const exists = R.find(R.propEq(id, "id"))(state.list);
      if (!exists) state.list.push({ id: id, ...payload });
    },
    removeAlert: (state, { payload: id }) => {
      state.list = R.reject(R.propEq(id, "id"))(state.list);
    },
    removeAll: (state) => {
      state.list = [];
    },
  },
});

export const actions = slice.actions;
export const reducer = slice.reducer;
