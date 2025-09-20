import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../middleware/axiosInstance";

// Initial State
const initialState = {
    voiceovers: [],
    currentVoiceover: null,
    status: "idle",
    error: null,
};

// Create Voiceover
export const createVoiceover = createAsyncThunk(
    "voiceover/create",
    async (voiceoverData, thunkAPI) => {
        try {
            const response = await axiosInstance.post("/voiceover", voiceoverData);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Fetch All Voiceovers
export const fetchAllVoiceovers = createAsyncThunk(
    "voiceover/fetchAll",
    async (_, thunkAPI) => {
        try {
            const response = await axiosInstance.get("/voiceover");
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Fetch Voiceover By ID
export const fetchVoiceoverById = createAsyncThunk(
    "voiceover/fetchById",
    async (id, thunkAPI) => {
        try {
            const response = await axiosInstance.get(`/voiceover/${id}`);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Update Voiceover
export const updateVoiceover = createAsyncThunk(
    "voiceover/update",
    async ({ id, updates }, thunkAPI) => {
        try {
            const response = await axiosInstance.patch(`/voiceover/${id}`, updates);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Delete Voiceover
export const deleteVoiceover = createAsyncThunk(
    "voiceover/delete",
    async (id, thunkAPI) => {
        try {
            await axiosInstance.delete(`/voiceover/${id}`);
            return id;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Slice
const voiceoverSlice = createSlice({
    name: "voiceover",
    initialState,
    reducers: {
        clearCurrentVoiceover: (state) => {
            state.currentVoiceover = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create
            .addCase(createVoiceover.pending, (state) => {
                state.status = "loading";
            })
            .addCase(createVoiceover.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.voiceovers.push(action.payload);
            })
            .addCase(createVoiceover.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Fetch All
            .addCase(fetchAllVoiceovers.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchAllVoiceovers.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.voiceovers = action.payload;
            })
            .addCase(fetchAllVoiceovers.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Fetch By ID
            .addCase(fetchVoiceoverById.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchVoiceoverById.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.currentVoiceover = action.payload;
            })
            .addCase(fetchVoiceoverById.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Update
            .addCase(updateVoiceover.pending, (state) => {
                state.status = "loading";
            })
            .addCase(updateVoiceover.fulfilled, (state, action) => {
                state.status = "succeeded";
                const updated = action.payload;
                state.voiceovers = state.voiceovers.map((v) =>
                    v.id === updated.id ? updated : v
                );
                if (state.currentVoiceover?.id === updated.id) {
                    state.currentVoiceover = updated;
                }
            })
            .addCase(updateVoiceover.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Delete
            .addCase(deleteVoiceover.pending, (state) => {
                state.status = "loading";
            })
            .addCase(deleteVoiceover.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.voiceovers = state.voiceovers.filter(
                    (v) => v.id !== action.payload
                );
                if (state.currentVoiceover?.id === action.payload) {
                    state.currentVoiceover = null;
                }
            })
            .addCase(deleteVoiceover.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export const { clearCurrentVoiceover } = voiceoverSlice.actions;

export default voiceoverSlice.reducer;
