import { configureStore } from "@reduxjs/toolkit";
import voiceoverSlice from "./slices/voiceover.slice.js";
import authSlice from "./slices/auth.slice.js";
import adminSlice from "./slices/admin.slice.js";
import podcastSlice from "./slices/podcast.slice.js";
import storySlice from "./slices/story.slice.js";
import creationsSlice from "./slices/creations.slice.js";
import overviewSlice from "./slices/overview.slice.js";
import voiceCloneSlice from "./slices/voice.clone.slice.js";

export const store = configureStore({
  reducer: {
    voiceover: voiceoverSlice,
    auth: authSlice,
    creations: creationsSlice,
    stories: storySlice,
    admin: adminSlice,
    podcast: podcastSlice,
    overview: overviewSlice,
    voiceClone: voiceCloneSlice,
  },
});
