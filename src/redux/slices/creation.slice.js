import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../middleware/axiosInstance";

// Initial State
const initialState = {
  creations: [],
  currentCreation: null,
  status: "idle",
  error: null,
};

// Create Creation
export const createCreation = createAsyncThunk(
  "creations/create",
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/creations", data);
      return response.data; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch All Creations
export const getCreations = createAsyncThunk(
  "creations/getAll",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/creations");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch Creation by ID
export const getCreationById = createAsyncThunk(
  "creations/getById",
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/creations/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update Creation
export const updateCreation = createAsyncThunk(
  "creations/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await axiosInstance.patch(`/creations/${id}`, data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete Creation
export const deleteCreation = createAsyncThunk(
  "creations/delete",
  async (id, thunkAPI) => {
    try {
      await axiosInstance.delete(`/creations/${id}`);
      return id; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Slice
const creationSlice = createSlice({
  name: "creations",
  initialState,
  reducers: {
    clearCurrentCreation: (state) => {
      state.currentCreation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createCreation.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createCreation.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.creations.push(action.payload);
      })
      .addCase(createCreation.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Get All
      .addCase(getCreations.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getCreations.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.creations = action.payload;
      })
      .addCase(getCreations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Get by ID
      .addCase(getCreationById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getCreationById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentCreation = action.payload;
      })
      .addCase(getCreationById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Update
      .addCase(updateCreation.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateCreation.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updated = action.payload;
        state.creations = state.creations.map((c) =>
          c.id === updated.id ? updated : c
        );
        if (state.currentCreation?.id === updated.id) {
          state.currentCreation = updated;
        }
      })
      .addCase(updateCreation.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteCreation.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteCreation.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.creations = state.creations.filter((c) => c.id !== action.payload);
        if (state.currentCreation?.id === action.payload) {
          state.currentCreation = null;
        }
      })
      .addCase(deleteCreation.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearCurrentCreation } = creationSlice.actions;

export default creationSlice.reducer;
