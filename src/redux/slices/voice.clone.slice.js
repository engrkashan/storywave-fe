import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../middleware/axiosInstance";
import Cookies from "js-cookie";

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
  async ({ file, text }, thunkAPI) => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("No token found");

      const adminId = Cookies.get("userId");
      if (!adminId) throw new Error("Missing adminId in cookies");

      const formData = new FormData();
      formData.append("adminId", adminId);
      formData.append("voice_sample", file);
      formData.append("text", text);

      const response = await axiosInstance.post("/voice-clone", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
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
      return response.data;
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
        console.log(action.payload.data)
      })
      .addCase(getClonedVoices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearVoiceClone } = voiceCloneSlice.actions;
export default voiceCloneSlice.reducer;
