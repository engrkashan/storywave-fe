/**
 * editor.slice.js
 * Redux slice for Storywave Editor.
 */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../middleware/axiosInstance";

// ── Async Thunks ─────────────────────────────────────────────────────────────

// Fetch list of workflows in review state
export const fetchEditorWorkflows = createAsyncThunk(
  "editor/fetchEditorWorkflows",
  async ({ page = 1, limit = 20 } = {}, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/editor/workflows?page=${page}&limit=${limit}`);
      return response.data?.data || response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Fetch single workflow detail for Editor
export const fetchEditorWorkflowDetail = createAsyncThunk(
  "editor/fetchEditorWorkflowDetail",
  async (workflowId, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/editor/workflows/${workflowId}`);
      return response.data?.data || response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Update prompt for a scene
export const updateScenePrompt = createAsyncThunk(
  "editor/updateScenePrompt",
  async ({ workflowId, sceneId, prompt }, thunkAPI) => {
    try {
      const response = await axiosInstance.patch(
        `/editor/workflows/${workflowId}/scenes/${sceneId}/prompt`,
        { prompt }
      );
      return { sceneId, prompt, data: response.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Request regeneration of a scene (Image or Veo 3 Video)
export const regenerateScene = createAsyncThunk(
  "editor/regenerateScene",
  async ({ workflowId, sceneId, prompt, characterReference, generateAsVideo }, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        `/editor/workflows/${workflowId}/scenes/${sceneId}/regenerate`,
        { prompt, characterReference, generateAsVideo }
      );
      return { sceneId, generateAsVideo, data: response.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Directly replace a scene frame with an uploaded custom image
export const replaceSceneFrame = createAsyncThunk(
  "editor/replaceSceneFrame",
  async ({ workflowId, sceneId, file, imageUrl, imageBase64 }, thunkAPI) => {
    try {
      let response;
      if (file instanceof File || file instanceof Blob) {
        const formData = new FormData();
        formData.append("image", file);
        response = await axiosInstance.post(
          `/editor/workflows/${workflowId}/scenes/${sceneId}/replace-frame`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        response = await axiosInstance.post(
          `/editor/workflows/${workflowId}/scenes/${sceneId}/replace-frame`,
          { imageUrl, imageBase64 }
        );
      }
      return { sceneId, data: response.data?.data || response.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Upload a character reference image for scene regeneration
export const uploadCharacterReference = createAsyncThunk(
  "editor/uploadCharacterReference",
  async ({ workflowId, sceneId, file, name }, thunkAPI) => {
    try {
      let response;
      if (file instanceof File || file instanceof Blob) {
        const formData = new FormData();
        formData.append("image", file);
        if (name) formData.append("name", name);
        response = await axiosInstance.post(
          `/editor/workflows/${workflowId}/scenes/${sceneId}/upload-ref`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        response = await axiosInstance.post(
          `/editor/workflows/${workflowId}/scenes/${sceneId}/upload-ref`,
          { imageUrl: file, name }
        );
      }
      return response.data?.data || response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Revert scene to a previous version
export const revertSceneVersion = createAsyncThunk(
  "editor/revertSceneVersion",
  async ({ workflowId, sceneId, version }, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        `/editor/workflows/${workflowId}/scenes/${sceneId}/revert/${version}`
      );
      return { sceneId, version, data: response.data?.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Check merge eligibility
export const checkMergeEligibility = createAsyncThunk(
  "editor/checkMergeEligibility",
  async (workflowId, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/editor/workflows/${workflowId}/merge/eligibility`);
      return response.data?.data || response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Start Merge & Continue
export const mergeWorkflow = createAsyncThunk(
  "editor/mergeWorkflow",
  async (workflowId, thunkAPI) => {
    try {
      const response = await axiosInstance.post(`/editor/workflows/${workflowId}/merge`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// ── Slice ────────────────────────────────────────────────────────────────────

const editorSlice = createSlice({
  name: "editor",
  initialState: {
    // List view
    workflows: [],
    totalWorkflows: 0,
    page: 1,
    totalPages: 1,
    listLoading: false,
    listError: null,

    // Detail view
    currentWorkflow: null,
    detailLoading: false,
    detailError: null,

    // Merge status
    mergeEligibility: null,
    isMerging: false,
    mergeError: null,
    mergeSuccess: false,
  },
  reducers: {
    clearCurrentWorkflow: (state) => {
      state.currentWorkflow = null;
      state.detailError = null;
      state.mergeEligibility = null;
      state.mergeSuccess = false;
      state.isMerging = false;
      state.mergeError = null;
    },
    resetMergeState: (state) => {
      state.isMerging = false;
      state.mergeError = null;
      state.mergeSuccess = false;
    },
    optimisticSetSceneStatus: (state, action) => {
      const { sceneId, status } = action.payload;
      if (state.currentWorkflow?.scenes) {
        const target = state.currentWorkflow.scenes.find((s) => s.id === sceneId);
        if (target) {
          target.status = status;
          if (status === "REGENERATING") {
            target.generationAttempts = (target.generationAttempts || 0) + 1;
          }
        }
      }
    },
    setWorkflowHeader: (state, action) => {
      state.currentWorkflow = {
        ...action.payload,
        scenes: state.currentWorkflow?.scenes || [],
      };
      state.detailLoading = false;
      state.detailError = null;
    },
    appendWorkflowScenes: (state, action) => {
      if (state.currentWorkflow) {
        const existingScenes = state.currentWorkflow.scenes || [];
        const existingIds = new Set(existingScenes.map((s) => s.id));
        const newScenes = (action.payload || []).filter((s) => !existingIds.has(s.id));
        state.currentWorkflow.scenes = [...existingScenes, ...newScenes];
      }
    },
    setWorkflowComplete: (state, action) => {
      if (action.payload) {
        state.currentWorkflow = action.payload;
      }
      state.detailLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchEditorWorkflows
      .addCase(fetchEditorWorkflows.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchEditorWorkflows.fulfilled, (state, action) => {
        state.listLoading = false;
        state.workflows = action.payload?.items || [];
        state.totalWorkflows = action.payload?.total || 0;
        state.page = action.payload?.page || 1;
        state.totalPages = action.payload?.totalPages || 1;
      })
      .addCase(fetchEditorWorkflows.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
      })

      // fetchEditorWorkflowDetail
      .addCase(fetchEditorWorkflowDetail.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchEditorWorkflowDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentWorkflow = action.payload;
      })
      .addCase(fetchEditorWorkflowDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      })

      // updateScenePrompt
      .addCase(updateScenePrompt.fulfilled, (state, action) => {
        const { sceneId, prompt } = action.payload;
        if (state.currentWorkflow?.scenes) {
          const scene = state.currentWorkflow.scenes.find((s) => s.id === sceneId);
          if (scene) {
            scene.userEditedPrompt = prompt;
            scene.activePrompt = prompt;
          }
        }
      })

      // replaceSceneFrame
      .addCase(replaceSceneFrame.fulfilled, (state, action) => {
        const { sceneId, data } = action.payload;
        if (state.currentWorkflow?.scenes) {
          const scene = state.currentWorkflow.scenes.find((s) => s.id === sceneId);
          if (scene && data) {
            scene.assetUrl = data.assetUrl || scene.assetUrl;
            scene.assetPublicId = data.assetPublicId || scene.assetPublicId;
            scene.assetType = "image";
            scene.activeVersion = data.activeVersion || scene.activeVersion;
            scene.status = "GENERATED";
            if (data.version) {
              scene.versions = [data.version, ...(scene.versions || [])];
            }
          }
        }
      })

      // regenerateScene
      .addCase(regenerateScene.fulfilled, (state, action) => {
        const { sceneId, generateAsVideo } = action.payload;
        if (state.currentWorkflow?.scenes) {
          const scene = state.currentWorkflow.scenes.find((s) => s.id === sceneId);
          if (scene) {
            scene.status = "REGENERATING";
            if (generateAsVideo) {
              scene.mediaType = "video";
            }
          }
        }
      })

      // revertSceneVersion
      .addCase(revertSceneVersion.fulfilled, (state, action) => {
        const { sceneId, version, data } = action.payload;
        if (state.currentWorkflow?.scenes) {
          const scene = state.currentWorkflow.scenes.find((s) => s.id === sceneId);
          if (scene) {
            scene.activeVersion = version;
            if (data?.assetUrl) scene.assetUrl = data.assetUrl;
            scene.status = "GENERATED";
          }
        }
      })

      // checkMergeEligibility
      .addCase(checkMergeEligibility.fulfilled, (state, action) => {
        state.mergeEligibility = action.payload;
      })

      // mergeWorkflow
      .addCase(mergeWorkflow.pending, (state) => {
        state.isMerging = true;
        state.mergeError = null;
      })
      .addCase(mergeWorkflow.fulfilled, (state) => {
        state.isMerging = false;
        state.mergeSuccess = true;
        if (state.currentWorkflow) {
          state.currentWorkflow.status = "PROCESSING";
        }
      })
      .addCase(mergeWorkflow.rejected, (state, action) => {
        state.isMerging = false;
        state.mergeError = action.payload;
      });
  },
});

export const {
  clearCurrentWorkflow,
  resetMergeState,
  optimisticSetSceneStatus,
  setWorkflowHeader,
  appendWorkflowScenes,
  setWorkflowComplete,
} = editorSlice.actions;
export default editorSlice.reducer;
