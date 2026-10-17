// import { createSlice } from "@reduxjs/toolkit";
// import { CurrentUserProfile } from "./profileServices";
// import { fetchCurrentProfile, logoutCurrentUser } from "./profileThunk";

// interface ProfileState {
//   data: CurrentUserProfile | null;
//   isLoading: boolean;
//   error: string | null;
// }

// const initialState: ProfileState = {
//   data: null,
//   isLoading: false,
//   error: null,
// };

// const profileSlice = createSlice({
//   name: "profile",
//   initialState,
//   reducers: {
//     clearProfileError(state) {
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchCurrentProfile.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchCurrentProfile.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.data = action.payload;
//       })
//       .addCase(fetchCurrentProfile.rejected, (state, action) => {
//         state.isLoading = false;
//         if (!action.meta.condition) {
//           state.error =
//             action.payload ?? action.error.message ?? "Unable to load profile";
//         }
//       })
//       .addCase(logoutCurrentUser.fulfilled, () => initialState);
//   },
// });

// export const { clearProfileError } = profileSlice.actions;
// export default profileSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import { CurrentUserProfile } from "./profileServices";
import {
  fetchCurrentProfile,
  logoutCurrentUser,
  updateCustomerProfile,
  updateWorkerAvailabilityStatus,
  updateWorkerProfile,
} from "./profileThunk";

interface ProfileState {
  data: CurrentUserProfile | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  data: null,
  isLoading: false,
  isUpdating: false,
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchCurrentProfile.rejected, (state, action) => {
        state.isLoading = false;

        if (!action.meta.condition) {
          state.error =
            action.payload ?? action.error.message ?? "Unable to load profile";
        }
      })

      .addCase(updateCustomerProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCustomerProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.data = action.payload;
      })
      .addCase(updateCustomerProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error =
          action.payload ?? action.error.message ?? "Unable to update profile";
      })

      .addCase(updateWorkerProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateWorkerProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.data = action.payload;
      })
      .addCase(updateWorkerProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error =
          action.payload ?? action.error.message ?? "Unable to update profile";
      })

      .addCase(updateWorkerAvailabilityStatus.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateWorkerAvailabilityStatus.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.data = action.payload;
      })
      .addCase(updateWorkerAvailabilityStatus.rejected, (state, action) => {
        state.isUpdating = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Unable to update worker availability";
      })

      .addCase(logoutCurrentUser.fulfilled, () => initialState);
  },
});

export const { clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;
