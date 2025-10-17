import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { serverInstance } from '../../api/serverInstance';
import type { Task } from '../../types';

interface ApiError {
  message: string;
  status: number;
}

export const fetchTasks = createAsyncThunk<
  Task[],
  string,
  { rejectValue: ApiError }
>('tasks/fetchTasks', async (projectId, { rejectWithValue }) => {
  try {
    const response = await serverInstance.get(`/${projectId}/tasks`);
    return response.data.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return rejectWithValue({
      message: axiosError.response?.data?.message || axiosError.message || 'Unknown error',
      status: axiosError.response?.status || 500,
    });
  }
});

export const createTask = createAsyncThunk<
  Task,
  { title: string; description: string; status: string; projectId: string },
  { rejectValue: ApiError }
>('tasks/createTask', async ({ title, description, status, projectId }, { rejectWithValue }) => {
  try {
    const response = await serverInstance.post(`/${projectId}/tasks`, { title, description, status, projectId });
    return response.data.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return rejectWithValue({
      message: axiosError.response?.data?.message || axiosError.message || 'Unknown error',
      status: axiosError.response?.status || 500,
    });
  }
});

export const updateTaskStatus = createAsyncThunk<
  Task,
  { taskId: string; status: string; projectId: string; title?: string; description?: string },
  { rejectValue: ApiError }
>('tasks/updateTaskStatus', async ({ taskId, status, projectId, title, description }, { rejectWithValue }) => {
  try {
    const response = await serverInstance.put(`/tasks/${taskId}`, { status, projectId, title, description });
    return response.data.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return rejectWithValue({
      message: axiosError.response?.data?.message || axiosError.message || 'Unknown error',
      status: axiosError.response?.status || 500,
    });
  }
});

export const deleteTask = createAsyncThunk<
  string,
  string,
  { rejectValue: ApiError }
>('tasks/deleteTask', async (taskId, { rejectWithValue }) => {
  try {
    await serverInstance.delete(`/tasks/${taskId}`);
    return taskId;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return rejectWithValue({
      message: axiosError.response?.data?.message || axiosError.message || 'Unknown error',
      status: axiosError.response?.status || 500,
    });
  }
});

export const getSummary = createAsyncThunk<
  string,
  string,
  { rejectValue: ApiError }
>('tasks/getSummary', async (projectId, { rejectWithValue }) => {
  try {
    const response = await serverInstance.post(`/ai/${projectId}/summarize`);
    return response.data.data.summary;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return rejectWithValue({
      message: axiosError.response?.data?.message || axiosError.message || 'Unknown error',
      status: axiosError.response?.status || 500,
    });
  }
});

export const askQuestion = createAsyncThunk<
  string,
  { taskId: string; question: string},
  { rejectValue: ApiError }
>('tasks/askQuestion', async ({ taskId, question}, { rejectWithValue }) => {
  try {
    const response = await serverInstance.post('/ai/qa', { taskId, question });
    return response.data.data.answer;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return rejectWithValue({
      message: axiosError.response?.data?.message || axiosError.message || 'Unknown error',
      status: axiosError.response?.status || 500,
    });
  }
});