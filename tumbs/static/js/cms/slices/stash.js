import { createSlice } from "@reduxjs/toolkit";
import { INIT } from "../config";

const initState = (websites) => {
  const currentWebsiteId = websites[websites.length - 1]?.id;
  const pagesByWebsiteId = Object.fromEntries(websites.map(({ id, pages }) => [id, pages]));
  const imagesByWebsiteId = Object.fromEntries(websites.map(({ id, images }) => [id, images]));

  return {
    websites: websites.map(({ pages, images, ...rest }) => rest),
    currentWebsiteId: currentWebsiteId,
    pagesByWebsiteId: pagesByWebsiteId,
    imagesByWebsiteId: imagesByWebsiteId,
  };
};

const slice = createSlice({
  name: "stash",
  initialState: initState(INIT.websites),
  reducers: {
    addWebsite: (state, { payload: ws }) => {
      state.websites.push(ws);
    },
    updateWebsite: (state, { payload: ws }) => {
      const idx = state.websites.findIndex((item) => item.id === ws.id);
      if (idx >= 0) {
        state.websites[idx] = ws;
      } else {
        state.websites.push(ws);
      }
      state.currentWebsiteId = ws.id;
    },
    setCurrentWebsite: (state, { payload: id }) => {
      const ws = state.websites.find((item) => item.id === id);
      if (ws) {
        state.currentWebsiteId = ws.id;
      }
    },
    addPage: (state, { payload: pg }) => {
      state.pagesByWebsiteId[state.currentWebsiteId]?.push(pg);
    },
    addImage: (state, { payload: im }) => {
      state.imagesByWebsiteId[state.currentWebsiteId]?.push(im);
    },
  },
  selectors: {
    selectWebsite: (state) => {
      return state.websites.find((item) => item.id === state.currentWebsiteId);
    },
    selectPages: (state) => {
      const ws = slice.getSelectors().selectWebsite(state);
      return state.pagesByWebsiteId[ws.id];
    },
    selectImages: (state) => {
      const ws = slice.getSelectors().selectWebsite(state);
      return state.imagesByWebsiteId[ws.id];
    },
  },
});

export const actions = slice.actions;
export const reducer = slice.reducer;
export const selectors = slice.selectors;
