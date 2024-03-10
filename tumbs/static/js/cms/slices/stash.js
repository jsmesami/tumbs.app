import { createSlice } from "@reduxjs/toolkit";
import { INIT } from "../config";

const slice = createSlice({
  name: "stash",
  initialState: {
    websites: INIT.websites,
    // If there are any websites, make the last one current:
    currentWebsiteId: INIT.websites.length ? INIT.websites[INIT.websites.length - 1].id : undefined,
  },
  reducers: {
    addWebsite: (state, { payload: website }) => {
      state.websites.push(website);
    },
    updateWebsite: (state, { payload: website }) => {
      const index = state.websites.findIndex((i) => i.id === website.id);
      const prevWebsite = state.websites[index];
      state.websites[index] = { ...prevWebsite, ...website };
    },
    setCurrentWebsite: (state, { payload: id }) => {
      const ws = state.websites.find((i) => i.id === id);
      if (ws) {
        state.currentWebsiteId = id;
      }
    },
    addPage: (state, { payload: { websiteId, page } }) => {
      const ws = state.websites.find((i) => i.id === websiteId);
      if (ws) {
        ws.pages.push(page);
      }
    },
    updatePage: (state, { payload: { websiteId, page } }) => {
      const ws = state.websites.find((i) => i.id === websiteId);
      if (ws) {
        const index = ws.images.findIndex((i) => i.id === page.id);
        const prevPage = ws.images[index];
        ws.images[index] = { ...prevPage, ...page };
      }
    },
  },
  selectors: {
    selectCurrentWebsite: (state) => {
      return state.websites.find((i) => i.id === state.currentWebsiteId);
    },
  },
});

export const actions = slice.actions;
export const reducer = slice.reducer;
export const selectors = slice.selectors;
