import { createSlice } from "@reduxjs/toolkit";
import { INIT } from "../config";

const slice = createSlice({
  name: "stash",
  initialState: {
    websites: INIT.websites,
    // If there are any websites, make the last one current:
    currentWebsiteId: INIT.websites.length ? INIT.websites[INIT.websites.length - 1].id : null,
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
    deleteWebsite: (state, { payload: { websiteId } }) => {
      state.websites = state.websites.filter((i) => i.id !== websiteId);
    },
    setCurrentWebsite: (state, { payload: websiteId }) => {
      const ws = state.websites.find((i) => i.id === websiteId);
      if (ws) state.currentWebsiteId = websiteId;
    },
    addPage: (state, { payload: { websiteId, page } }) => {
      const ws = state.websites.find((i) => i.id === websiteId);
      if (ws) ws.pages.push(page);
    },
    updatePage: (state, { payload: { websiteId, page } }) => {
      const ws = state.websites.find((i) => i.id === websiteId);
      if (ws) {
        const index = ws.pages.findIndex((i) => i.id === page.id);
        const prevPage = ws.pages[index];
        ws.pages[index] = { ...prevPage, ...page };
      }
    },
    deletePage: (state, { payload: { websiteId, pageId } }) => {
      const ws = state.websites.find((i) => i.id === websiteId);
      if (ws) {
        ws.pages = ws.pages.filter((i) => i.id !== pageId);
      }
    },
    addWidget: (state, { payload: { websiteId, pageId, widget } }) => {
      const ws = state.websites.find((i) => i.id === websiteId);
      const pg = ws && ws.pages.find((i) => i.id === pageId);
      if (pg) {
        pg.content.unshift(widget);
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
