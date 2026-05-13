import { createSlice } from "@reduxjs/toolkit";

const mySlice = createSlice({
  name: "setNewChat",
  initialState: {
    value: false,
    previousChat: 0,
    requestDemoModel: false,
    message: "",
    contactModel: false,
  },
  reducers: {
    setValue: (state, action) => {
      state.value = action.payload;
    },
    resetValue: (state) => {
      state.value = false;
    },
    setPreviousChat: (state, action) => {
      state.previousChat = action.payload;
    },
    resetPreviousChat: (state) => {
      state.previousChat = 0;
    },
    setLogoutModal: (state, action) => {
      state.logoutModal = action.payload;
    },
    resetLogoutModal: (state) => {
      state.logoutModal = false;
    },
    setDeleteModel: (state, action) => {
      state.deleteModel = action.payload;
    },
    resetDeleteModal: (state) => {
      state.deleteModel = false;
    },
    setRequestDemoModel: (state, action) => {
      state.requestDemoModel = action.payload;
    },
    resetRequestDemoModel: (state) => {
      state.requestDemoModel = false;
    },
    setMessage: (state, action) => {
      state.message = action.payload;
    },
    resetMessage: (state) => {
      state.message = "";
    },
    setContactModel: (state, action) => {
      state.contactModel = action.payload;
    },
    resetContactModel: (state) => {
      state.contactModel = false;
    },
  },
});

export const {
  setValue,
  resetValue,
  setPreviousChat,
  resetPreviousChat,
  setLogoutModal,
  resetLogoutModal,
  setDeleteModel,
  resetDeleteModal,
  setRequestDemoModel,
  resetRequestDemoModel,
  setMessage,
  resetMessage,
  setContactModel,
  resetContactModel,
} = mySlice.actions;
export default mySlice.reducer;
