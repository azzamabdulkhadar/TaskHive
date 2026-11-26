import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: "light" },
  reducers: {
    setTheme: (state, action) => {
      state.mode = action.payload; // "light" | "dark"
      document.documentElement.setAttribute("data-theme", action.payload);
    },
    toggleTheme: (state) => {
      const next = state.mode === "light" ? "dark" : "light";
      state.mode = next;
      document.documentElement.setAttribute("data-theme", next);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
