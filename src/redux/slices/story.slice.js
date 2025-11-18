import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../middleware/axiosInstance";

const initialState = {
  outline: null,
  script: null,
  scheduled: [],
  status: "idle",
  error: null,
};

// Get Scheduled Stories
export const getScheduledStories = createAsyncThunk(
  "story/getScheduledStories",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/story/scheduled");
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// generate story
export const generateStory = createAsyncThunk(
  "story/generate",
  async (storyData, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/story/workflow", storyData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// delete story
export const deleteStory = createAsyncThunk(
  "story/delete",
  async (storyId, thunkAPI) => {
    try {
      await axiosInstance.delete(`/story/${storyId}`);
      return { storyId };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const storySlice = createSlice({
  name: "story",
  initialState,
  reducers: {
    clearStory: (state) => {
      state.outline = null;
      state.script = null;
      state.scheduled = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // generateStory
      .addCase(generateStory.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(generateStory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.outline = action.payload.outline;
        state.script = action.payload.script;
      })
      .addCase(generateStory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // getScheduledStories
      .addCase(getScheduledStories.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getScheduledStories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.scheduled = action.payload;
      })
      .addCase(getScheduledStories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // deleteStory
      .addCase(deleteStory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteStory.fulfilled, (state, action) => {
        state.status = "succeeded";
        const id = action.payload.storyId;
        if (state.stories) {
          state.stories = state.stories.filter((s) => s.id !== id);
        }
      })
      .addCase(deleteStory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearStory } = storySlice.actions;

export default storySlice.reducer;
