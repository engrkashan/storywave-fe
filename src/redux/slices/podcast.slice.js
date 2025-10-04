import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../middleware/axiosInstance";

// Initial State
const initialState = {
  podcast: null, 
  podcasts: [], 
  status: "idle",
  error: null,
};

// =================== THUNKS ===================

// Create Podcast
export const generatePodcast = createAsyncThunk(
  "podcast/create",
  async (podcastData, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/podcast", podcastData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get All Podcasts
export const getPodcasts = createAsyncThunk(
  "podcast/getAll",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/podcast");
      return response.data?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// =================== SLICE ===================
const podcastSlice = createSlice({
  name: "podcast",
  initialState,
  reducers: {
    clearPodcast: (state) => {
      state.podcast = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ---- Create Podcast ----
      .addCase(generatePodcast.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(generatePodcast.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.podcast = action.payload.data;
      })
      .addCase(generatePodcast.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // ---- Get Podcasts ----
      .addCase(getPodcasts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getPodcasts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.podcasts = action.payload.data; 
      })
      .addCase(getPodcasts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

// =================== EXPORTS ===================
export const { clearPodcast } = podcastSlice.actions;
export default podcastSlice.reducer;
