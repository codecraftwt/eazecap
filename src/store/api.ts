import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

/* =============================
   TYPES & INTERFACES
=============================== */
interface SalesforceState {
  salesforceToken: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

interface SubmitDataPayload {
  accountId: string;
  userData: Record<string, any>;
}

/* =============================
   HELPERS & ERROR HANDLING
=============================== */
const showError = (msg: string) => toast.error(msg);
const showSuccess = (msg: string) => toast.success(msg);

const handleAxiosError = (error: any) => {
  if (error.message === "Network Error" || !error.response) {
    return "Connection to Salesforce failed. Check CORS or Network.";
  }
  const status = error.response.status;
  if (status === 401) return "Unauthorized: Session expired.";
  if (status === 404) return "API endpoint not found.";
  return error.response.data?.message || "Unexpected error occurred";
};

/* =========================================================
   1. GET SALESFORCE ACCESS TOKEN THUNK
========================================================= */
export const fetchSalesforceToken = createAsyncThunk(
  "salesforce/fetchToken",
  async (_, { rejectWithValue }) => {
    try {
      // Note: In production, use your backend proxy URL here
      const response = await axios.post(`${import.meta.env.VITE_API_TOKEN_URL}api/token`, {
        SF_INSTANCE: import.meta.env.VITE_API_URL,
        CLIENT_ID: import.meta.env.VITE_SF_CLIENT_ID,
        CLIENT_SECRET: import.meta.env.VITE_SF_CLIENT_SECRET,
      });
      return response.data; // Expected { access_token: "..." }
    } catch (error: any) {
      const msg = handleAxiosError(error);
      showError(msg);
      return rejectWithValue(msg);
    }
  }
);

/* =========================================================
   2. SUBMIT DATA THUNK
========================================================= */
export const submitEazeCapData = createAsyncThunk(
  "salesforce/submitData",
  async ({ accountId, userData }: SubmitDataPayload, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { salesforce: SalesforceState };
      const token = state.salesforce.salesforceToken;

      if (!token) return rejectWithValue("No access token found. Please authenticate first.");

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/services/apexrest/salesforce/eazecap/api/sendeazecapdata`,
        { accountId, jsonbody: userData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      showSuccess("Data synced to Salesforce!");
      return response.data;
    } catch (error: any) {
      const msg = handleAxiosError(error);
      showError(msg);
      return rejectWithValue(msg);
    }
  }
);

/* =============================
   SLICE
=============================== */
const salesforceSlice = createSlice({
  name: "salesforce",
  initialState: {
    salesforceToken: null,
    status: "idle",
    error: null,
  } as SalesforceState,
  reducers: {
    clearSalesforceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* Token Fetching */
      .addCase(fetchSalesforceToken.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSalesforceToken.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.salesforceToken = action.payload.access_token;
      })
      .addCase(fetchSalesforceToken.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      /* Data Submission */
      .addCase(submitEazeCapData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(submitEazeCapData.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(submitEazeCapData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearSalesforceError } = salesforceSlice.actions;
export default salesforceSlice.reducer;