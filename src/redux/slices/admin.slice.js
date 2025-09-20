import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../middleware/axiosInstance";

// Initial state
const initialState = {
    profile: null,
    status: "idle",
    error: null,
};

// Get Admin Profile
export const getAdminProfile = createAsyncThunk(
    "admin/getProfile",
    async (_, thunkAPI) => {
        try {
            const response = await axiosInstance.get("/admin/profile");
            return response.data; 
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Update Admin Profile
export const updateAdminProfile = createAsyncThunk(
    "admin/updateProfile",
    async (profileData, thunkAPI) => {
        try {
            const response = await axiosInstance.patch("/admin/profile", profileData);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Change Admin Password
export const changeAdminPassword = createAsyncThunk(
    "admin/changePassword",
    async (passwordData, thunkAPI) => {
        try {
            const response = await axiosInstance.patch(
                "/admin/change-password",
                passwordData
            );
            return response.data; 
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Delete Admin User
export const deleteAdminUser = createAsyncThunk(
    "admin/deleteAdminUser",
    async (userId, thunkAPI) => {
        try {
            await axiosInstance.delete(`/admin/${userId}`);
            return userId; 
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Slice
const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        clearAdminState: (state) => {
            state.profile = null;
            state.status = "idle";
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get Profile
            .addCase(getAdminProfile.pending, (state) => {
                state.status = "loading";
            })
            .addCase(getAdminProfile.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.profile = action.payload;
            })
            .addCase(getAdminProfile.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Update Profile
            .addCase(updateAdminProfile.pending, (state) => {
                state.status = "loading";
            })
            .addCase(updateAdminProfile.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.profile = action.payload;
            })
            .addCase(updateAdminProfile.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Change Password
            .addCase(changeAdminPassword.pending, (state) => {
                state.status = "loading";
            })
            .addCase(changeAdminPassword.fulfilled, (state) => {
                state.status = "succeeded";
            })
            .addCase(changeAdminPassword.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Delete Admin User
            .addCase(deleteAdminUser.pending, (state) => {
                state.status = "loading";
            })
            .addCase(deleteAdminUser.fulfilled, (state, action) => {
                state.status = "succeeded";
                if (state.profile && state.profile.id === action.payload) {
                    state.profile = null;
                }
            })
            .addCase(deleteAdminUser.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export const { clearAdminState } = adminSlice.actions;

export default adminSlice.reducer;
