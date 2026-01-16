import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/auth.slice.js";
import adminSlice from "./slices/admin.slice.js";
import storySlice from "./slices/story.slice.js";
import creationsSlice from "./slices/creations.slice.js";
import overviewSlice from "./slices/overview.slice.js";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    creations: creationsSlice,
    stories: storySlice,
    admin: adminSlice,
    overview: overviewSlice,
  },
});
