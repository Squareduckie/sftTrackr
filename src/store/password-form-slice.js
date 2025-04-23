import { createSlice } from "@reduxjs/toolkit";

const initialState = { isOutputModalVisible: false, generatedPassword: "" };
const passwordFormSlice = createSlice({
  name: "passwordForm",
  initialState,
  reducers: {
    openOutputModal(state) {
      state.isOutputModalVisible = true;
    },
    closeOutputModal(state) {
      state.isOutputModalVisible = false;
    },
    updateGeneratedPassword(state, action) {
      state.generatedPassword = action.payload;
    },
  },
});
export const passwordFormActions = passwordFormSlice.actions;
export default passwordFormSlice;
