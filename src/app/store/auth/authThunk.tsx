import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  AuthUser,
  loginAccount,
  LoginRequest,
  registerAccount,
  RegisterRequest,
} from "./authServices";

export const registerUser = createAsyncThunk<
  { message: string; user?: AuthUser },
  RegisterRequest,
  { rejectValue: string }
>("apiAuth/register", async (request, { rejectWithValue }) => {
  try {
    return await registerAccount(request);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Registration failed",
    );
  }
});

export const loginUser = createAsyncThunk<
  { token: string; user: AuthUser },
  LoginRequest,
  { rejectValue: string }
>("apiAuth/login", async (request, { rejectWithValue }) => {
  try {
    return await loginAccount(request);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Login failed",
    );
  }
});
