import { configureStore } from "@reduxjs/toolkit";
import passwordFormSlice from "./password-form-slice";

const store = configureStore({
  reducer: {
    passwordForm: passwordFormSlice.reducer,
  },
});

export default store;
