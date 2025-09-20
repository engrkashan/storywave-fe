import { configureStore } from "@reduxjs/toolkit";
import voiceoverSlice from "./slices/voiceover.slice.js";
import authSlice from "./slices/auth.slice.js";
import creationSlice from "./slices/creation.slice.js";
import adminSlice from "./slices/admin.slice.js";

export const store = configureStore({
  reducer: {
    voiceover: voiceoverSlice,
    auth: authSlice,
    creation: creationSlice,
    admin: adminSlice,
  },
});
