import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../middleware/axiosInstance";

export const fetchHealth = createAsyncThunk("publish/fetchHealth", async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get("/publish/health");
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchChannels = createAsyncThunk("publish/fetchChannels", async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get("/publish/channels");
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchPosts = createAsyncThunk("publish/fetchPosts", async (params, thunkAPI) => {
  try {
    const response = await axiosInstance.get("/publish/posts", { params });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchStats = createAsyncThunk("publish/fetchStats", async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get("/publish/stats");
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const syncStatuses = createAsyncThunk("publish/syncStatuses", async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.post("/publish/sync");
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const schedulePost = createAsyncThunk("publish/schedulePost", async (payload, thunkAPI) => {
  try {
    const response = await axiosInstance.post("/publish/post", payload);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const cancelPost = createAsyncThunk("publish/cancelPost", async (postId, thunkAPI) => {
  try {
    const response = await axiosInstance.patch(`/publish/posts/${postId}/cancel`);
    return { postId, ...response.data };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const reschedulePost = createAsyncThunk("publish/reschedulePost", async ({ postId, scheduledAt }, thunkAPI) => {
  try {
    const response = await axiosInstance.patch(`/publish/posts/${postId}/reschedule`, { scheduledAt });
    return { postId, scheduledAt, ...response.data };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

// We can also fetch workflows here for the dropdown, or use overview/story slices.
// Since publish index fetches from /story/, let's add it here to keep publish slice self-contained for its own needs if needed,
// but it's better to fetch workflows here specifically for publish.
export const fetchWorkflowsForPublish = createAsyncThunk("publish/fetchWorkflows", async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get("/overview");
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

const initialState = {
  mallaryConnected: null,
  channels: [],
  posts: [],
  stats: null,
  workflows: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  channelsStatus: "idle",
  postsStatus: "idle",
  syncStatus: "idle",
  error: null,
};

const publishSlice = createSlice({
  name: "publish",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Health
      .addCase(fetchHealth.fulfilled, (state, action) => {
        state.mallaryConnected = action.payload.mallaryConnected ?? false;
      })
      // Channels
      .addCase(fetchChannels.pending, (state) => {
        state.channelsStatus = "loading";
      })
      .addCase(fetchChannels.fulfilled, (state, action) => {
        state.channelsStatus = "succeeded";
        state.channels = action.payload.channels || [];
      })
      .addCase(fetchChannels.rejected, (state, action) => {
        state.channelsStatus = "failed";
        state.error = action.payload;
        state.mallaryConnected = false;
      })
      // Posts
      .addCase(fetchPosts.pending, (state) => {
        state.postsStatus = "loading";
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.postsStatus = "succeeded";
        state.posts = action.payload.posts || [];
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.postsStatus = "failed";
        state.error = action.payload;
      })
      // Stats
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload.stats || null;
      })
      // Workflows
      .addCase(fetchWorkflowsForPublish.fulfilled, (state, action) => {
        state.workflows = action.payload.stories || [];
      })
      // Sync
      .addCase(syncStatuses.pending, (state) => {
        state.syncStatus = "loading";
      })
      .addCase(syncStatuses.fulfilled, (state) => {
        state.syncStatus = "succeeded";
      })
      .addCase(syncStatuses.rejected, (state) => {
        state.syncStatus = "failed";
      })
      // Cancel
      .addCase(cancelPost.fulfilled, (state, action) => {
        const post = state.posts.find(p => p.id === action.payload.postId);
        if (post) post.status = "CANCELLED";
      })
      // Reschedule
      .addCase(reschedulePost.fulfilled, (state, action) => {
        const post = state.posts.find(p => p.id === action.payload.postId);
        if (post) post.scheduledAt = action.payload.scheduledAt;
      });
  },
});

export default publishSlice.reducer;
