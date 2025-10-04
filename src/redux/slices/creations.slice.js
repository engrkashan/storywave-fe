import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../middleware/axiosInstance";

const initialState = {
  stories: [],
  podcasts: [],
  status: "idle",
  error: null,
  totalStories: 0,
  totalPodcasts: 0,
};

// Thunk to fetch My Creations
export const fetchMyCreations = createAsyncThunk(
  "creations/fetchMyCreations",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/creations");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const creationsSlice = createSlice({
  name: "creations",
  initialState,
  reducers: {
    clearCreations: (state) => {
      state.stories = [];
      state.podcasts = [];
      state.totalStories = 0;
      state.totalPodcasts = 0;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyCreations.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMyCreations.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stories = action.payload.data.stories || [];
        state.podcasts = action.payload.data.podcasts || [];
        state.totalStories = action.payload.totalStories || 0;
        state.totalPodcasts = action.payload.totalPodcasts || 0;
      })
      .addCase(fetchMyCreations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch creations";
      });
  },
});

export const { clearCreations } = creationsSlice.actions;
export default creationsSlice.reducer;
