import { createAsyncThunk } from '@reduxjs/toolkit';
import { serverInstance } from '../../api/serverInstance';
import { CustomApiError } from '../../utils/CustomError';
import type { Project } from '../../types';

export const fetchProjects = createAsyncThunk<
  Project[],
  void,
  { rejectValue: CustomApiError }
>(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await serverInstance.get('/projects');
      return response.data.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(new CustomApiError(error.message, 500));
      } else {
        return rejectWithValue(new CustomApiError('Unknown error', 500));
      }
    }
  }
);

export const createProject = createAsyncThunk<
  Project,
  { name: string; description: string },
  { rejectValue: CustomApiError }
>(
  'projects/createProject',
  async ({ name, description }, { rejectWithValue }) => {
    try {
      const response = await serverInstance.post('/projects', { name, description });
      return response.data.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(new CustomApiError(error.message, 500));
      } else {
        return rejectWithValue(new CustomApiError('Unknown error', 500));
      }
    }
  }
);

export const updateProject = createAsyncThunk<
  Project,
  { id: string; name: string; description: string },
  { rejectValue: CustomApiError }
>(
  'projects/updateProject',
  async ({ id, name, description }, { rejectWithValue }) => {
    try {
      const response = await serverInstance.put(`/projects/${id}`, { name, description });
      return response.data.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(new CustomApiError(error.message, 500));
      } else {
        return rejectWithValue(new CustomApiError('Unknown error', 500));
      }
    }
  }
);

export const deleteProject = createAsyncThunk<
  void,
  string,
  { rejectValue: CustomApiError }
>(
  'projects/deleteProject',
  async (id, { rejectWithValue }) => {
    try {
      await serverInstance.delete(`/projects/${id}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(new CustomApiError(error.message, 500));
      } else {
        return rejectWithValue(new CustomApiError('Unknown error', 500));
      }
    }
  }
);