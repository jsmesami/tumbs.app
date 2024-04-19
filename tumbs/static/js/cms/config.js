export const appContainer = document.getElementById("cms");

export const INIT = JSON.parse(appContainer.dataset.init);

export const maxPages = 8;

export const autoDismissMs = 3000;

export const defaultDebounceMs = 3000;

export const imagesUploadChunkSize = 5; // How many images can be uploaded in parallel
