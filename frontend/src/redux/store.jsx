import { configureStore } from "@reduxjs/toolkit";
import sessionSlice from "./slices/sessionSlice";

export default configureStore({
  reducer: {
    session: sessionSlice,
  },
});
