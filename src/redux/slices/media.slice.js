import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../middleware/axiosInstance";

// Initial State
const initialState = {
  media: [],
  currentMedia: null,
  status: "idle",
  error: null,
};

// Upload Media (multipart/form-data)
export const uploadMedia = createAsyncThunk(
  "media/upload",
  async (fileData, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("file", fileData);

      const response = await axiosInstance.post("/media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch All Media
export const fetchAllMedia = createAsyncThunk(
  "media/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/media");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch Media by ID
export const fetchMediaById = createAsyncThunk(
  "media/fetchById",
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/media/${id}`);
      return response.data; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete Media
export const deleteMedia = createAsyncThunk(
  "media/delete",
  async (id, thunkAPI) => {
    try {
      await axiosInstance.delete(`/media/${id}`);
      return id; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Slice
const mediaSlice = createSlice({
  name: "media",
  initialState,
  reducers: {
    clearCurrentMedia: (state) => {
      state.currentMedia = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload
      .addCase(uploadMedia.pending, (state) => {
        state.status = "loading";
      })
      .addCase(uploadMedia.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.media.push(action.payload);
      })
      .addCase(uploadMedia.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch All
      .addCase(fetchAllMedia.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllMedia.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.media = action.payload;
      })
      .addCase(fetchAllMedia.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch By ID
      .addCase(fetchMediaById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMediaById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentMedia = action.payload;
      })
      .addCase(fetchMediaById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteMedia.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteMedia.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.media = state.media.filter((m) => m.id !== action.payload);
        if (state.currentMedia?.id === action.payload) {
          state.currentMedia = null;
        }
      })
      .addCase(deleteMedia.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearCurrentMedia } = mediaSlice.actions;

export default mediaSlice.reducer;
