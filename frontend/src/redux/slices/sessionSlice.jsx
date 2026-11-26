import { createSlice } from "@reduxjs/toolkit";

export const sessionSlice = createSlice({
  name: "session",
  initialState: {
    userData: null,
  },
  reducers: {
    login: (state, data) => {
      state.userData = data?.payload;
    },
    logout: (state) => {
      state.userData = null;
    },
  },
});

export const { login, logout } = sessionSlice.actions;

export default sessionSlice.reducer;
