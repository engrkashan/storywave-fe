import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../middleware/axiosInstance";

// Async thunk to fetch overview data
export const fetchOverview = createAsyncThunk(
  "overview/fetchOverview",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/overview");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  totalStories: 0,
  videosCreated: 0,
  voiceovers: 0,
  podcasts: 0,
  stories: [],
  status: "idle",
  error: null,
};

const overviewSlice = createSlice({
  name: "overview",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverview.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOverview.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.totalStories = action.payload.totalStories;
        state.videosCreated = action.payload.totalVideos;
        state.voiceovers = action.payload.totalVoiceovers;
        state.podcasts = action.payload.totalPodcasts;
        state.stories = action.payload.stories;
      })
      .addCase(fetchOverview.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default overviewSlice.reducer;
