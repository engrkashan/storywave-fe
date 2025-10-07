import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../middleware/axiosInstance";

// =================== INITIAL STATE ===================
const initialState = {
  clone: null,
  clones: [],
  status: "idle",
  error: null,
};

// =================== THUNKS ===================

// Upload & Clone Voice
export const cloneVoice = createAsyncThunk(
  "voiceClone/clone",
  async (file, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("voice_sample", file);

      const response = await axiosInstance.post("/voice-clone", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get All Cloned Voices
export const getClonedVoices = createAsyncThunk(
  "voiceClone/getAll",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/voice-clone");
      return response.data?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// =================== SLICE ===================
const voiceCloneSlice = createSlice({
  name: "voiceClone",
  initialState,
  reducers: {
    clearVoiceClone: (state) => {
      state.clone = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ---- Clone Voice ----
      .addCase(cloneVoice.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(cloneVoice.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.clone = action.payload.data;
      })
      .addCase(cloneVoice.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // ---- Get Cloned Voices ----
      .addCase(getClonedVoices.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getClonedVoices.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.clones = action.payload?.data || [];
      })
      .addCase(getClonedVoices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

// =================== EXPORTS ===================
export const { clearVoiceClone } = voiceCloneSlice.actions;
export default voiceCloneSlice.reducer;
