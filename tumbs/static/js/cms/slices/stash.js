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
    addWebsite: (state, { payload }) => {
      const { pages, images, ...website } = payload;
      state.pagesByWebsiteId[website.id] = pages;
      state.imagesByWebsiteId[website.id] = images;
      state.websites.push(website);
    },
    updateWebsite: (state, { payload }) => {
      const { pages, images, ...website } = payload;
      const index = state.websites.findIndex((item) => item.id === website.id);
      state.websites[index] = { ...state.websites[index], ...website };
    },
    setCurrentWebsite: (state, { payload: id }) => {
      const website = state.websites.find((item) => item.id === id);
      if (website) {
        state.currentWebsiteId = website.id;
      }
    },
    addPage: (state, { payload: page }) => {
      state.pagesByWebsiteId[state.currentWebsiteId].push(page);
    },
    updatePage: (state, { payload: page }) => {
      const pages = state.pagesByWebsiteId[state.currentWebsiteId];
      const index = pages.findIndex((item) => item.id === page.id);
      pages[index] = { ...pages[index], ...page };
    },
    addImage: (state, { payload: image }) => {
      state.imagesByWebsiteId[state.currentWebsiteId].push(image);
    },
    updateImage: (state, { payload: image }) => {
      const images = state.imagesByWebsiteId[state.currentWebsiteId];
      const index = images.findIndex((item) => item.id === image.id);
      images[index] = { ...images[index], ...image };
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
