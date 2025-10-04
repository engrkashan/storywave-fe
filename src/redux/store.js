import { configureStore } from "@reduxjs/toolkit";
import voiceoverSlice from "./slices/voiceover.slice.js";
import authSlice from "./slices/auth.slice.js";
import adminSlice from "./slices/admin.slice.js";
import podcastSlice from "./slices/podcast.slice.js";
import creationsSlice from "./slices/creations.slice.js";
import overviewSlice from "./slices/overview.slice.js";

export const store = configureStore({
  reducer: {
    voiceover: voiceoverSlice,
    auth: authSlice,
    creations: creationsSlice,
    admin: adminSlice,
    podcast: podcastSlice,
    overview: overviewSlice,
  },
});
