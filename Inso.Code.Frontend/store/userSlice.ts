import { createSlice } from "@reduxjs/toolkit";

import { UseStatusType } from "@/types/user";

const userInitialState: UseStatusType = {
  isLoading: false,
  data: {
    _id: "",
    email: "",
    role: "",
    profile: "",
    isProfileComplete: false,
    plan: "",
    paymentStatus: undefined,
    createdAt: "",
    updatedAt: "",
    __v: 0,
    resetPasswordExpires: "",
    resetPasswordOTP: "",
    username: "",
    location: "",
    description: "",
  },
};

const userController = createSlice({
  name: "userController",
  initialState: userInitialState,
  reducers: {
    setUserProfile(state, payload) {
      state.data = payload.payload;
    },
    updateProfile(state, payload) {
      state.data = payload.payload;
    },
  },
});

export default userController.reducer;
export { userController, userInitialState };
