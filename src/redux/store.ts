import { configureStore } from '@reduxjs/toolkit';
import projectsReducer from './reducers/projectsSlice'; 
import tasksReducer from './reducers/tasksSlice'; 

export const store = configureStore({
    reducer: {
        projects: projectsReducer,
        tasks: tasksReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;