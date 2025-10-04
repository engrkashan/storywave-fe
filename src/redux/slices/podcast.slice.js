import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../middleware/axiosInstance";

// Initial State
const initialState = {
  podcast: null,
  status: "idle",
  error: null,
};

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
      .addCase(generatePodcast.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(generatePodcast.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.podcast = action.payload;
      })
      .addCase(generatePodcast.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearPodcast } = podcastSlice.actions;

export default podcastSlice.reducer;
