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

// Async thunk to fetch workflow detail by ID
export const fetchWorkflowById = createAsyncThunk(
  "overview/fetchWorkflowById",
  async (workflowId, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/overview/${workflowId}`);
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
  workflow: null,
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
  reducers: {
    clearWorkflowDetail: (state) => {
      state.workflow = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Overview
      .addCase(fetchOverview.pending, (state) => {
        // Only show loading if we don't have any stories yet
        if (state.stories.length === 0) {
          state.status = "loading";
        }
        state.error = null;
      })
      .addCase(fetchOverview.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.totalStories = action.payload.totalStories;
        state.videosCreated = action.payload.videosCreated;
        state.voiceovers = action.payload.voiceovers;
        state.podcasts = action.payload.podcasts;
        state.stories = action.payload.stories;
      })
      .addCase(fetchOverview.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch Workflow by ID
      .addCase(fetchWorkflowById.pending, (state, action) => {
        // Only show loading if the requested workflow is different from the one in store
        const workflowId = action.meta.arg;
        if (!state.workflow || state.workflow.id !== workflowId) {
          state.status = "loading";
        }
        state.error = null;
      })
      .addCase(fetchWorkflowById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.workflow = action.payload;
      })
      .addCase(fetchWorkflowById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Cancel Workflow
      .addCase(cancelWorkflow.fulfilled, (state, action) => {
        const workflowId = action.payload;
        const story = state.stories.find((s) => s.id === workflowId);
        if (story) story.status = "CANCELLED";
        if (state.workflow && state.workflow.id === workflowId) {
          state.workflow.status = "CANCELLED";
        }
      })

      // Delete Workflow
      .addCase(deleteWorkflow.pending, (state) => {
        state.deleteStatus = "loading";
      })
      .addCase(deleteWorkflow.fulfilled, (state, action) => {
        const workflowId = action.payload;
        state.deleteStatus = "succeeded";

        // Find the deleted story BEFORE filtering to check if it's a podcast
        const deletedStory = state.stories.find((s) => s.id === workflowId);

        // Update counters BEFORE filtering
        state.totalStories = Math.max(0, state.totalStories - 1);

        // Check if deleted story was a podcast and update podcast count
        if (deletedStory?.isPodcast) {
          state.podcasts = Math.max(0, state.podcasts - 1);
        }

        // Now filter out the deleted story
        state.stories = state.stories.filter((s) => s.id !== workflowId);

        if (state.workflow && state.workflow.id === workflowId) {
          state.workflow = null;
        }
      })
      .addCase(deleteWorkflow.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearWorkflowDetail } = overviewSlice.actions;
export default overviewSlice.reducer;
