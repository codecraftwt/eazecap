import { configureStore } from '@reduxjs/toolkit';
// 1. Import the default export (the reducer) from your api.ts
import salesforceReducer from './api'; 

export const store = configureStore({
  reducer: {
    // 2. Map the reducer to the 'salesforce' key
    salesforce: salesforceReducer,
  },
  // 3. Since you are using Thunks/Axios and NOT RTK Query, 
  // you don't need the extra middleware configuration.
});

/* =========================================================
   TYPESCRIPT TYPES
========================================================= */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;