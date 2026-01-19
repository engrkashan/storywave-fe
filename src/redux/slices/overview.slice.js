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
  },
);

// Async thunk to cancel a workflow
export const cancelWorkflow = createAsyncThunk(
  "overview/cancelWorkflow",
  async (workflowId, thunkAPI) => {
    try {
      await axiosInstance.post(`/overview/cancel/${workflowId}`);
      return workflowId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Async thunk to delete a workflow
export const deleteWorkflow = createAsyncThunk(
  "overview/deleteWorkflow",
  async (workflowId, thunkAPI) => {
    try {
      await axiosInstance.delete(`/overview/${workflowId}`);
      return workflowId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);

const initialState = {
  totalStories: 0,
  videosCreated: 0,
  voiceovers: 0,
  podcasts: 0,
  stories: [],
  status: "idle",
  deleteStatus: "idle",
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
      })
      // Handle Cancel Workflow
      .addCase(cancelWorkflow.fulfilled, (state, action) => {
        const story = state.stories.find((s) => s.id === action.payload);
        if (story) {
          story.status = "CANCELLED";
        }
      })

      // Handle Delete Workflow
      .addCase(deleteWorkflow.pending, (state) => {
        state.deleteStatus = "loading";
      })
      .addCase(deleteWorkflow.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";

        // Remove workflow from list
        state.stories = state.stories.filter(
          (story) => story.id !== action.payload,
        );

        // Update counters safely
        state.totalStories = Math.max(0, state.totalStories - 1);
      })
      .addCase(deleteWorkflow.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.error = action.payload;
      });
  },
});

export default overviewSlice.reducer;
