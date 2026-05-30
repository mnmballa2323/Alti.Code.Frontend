import { configureStore } from "@reduxjs/toolkit";
import userInitialState from './userSlice';
import setNewChatReducer from "./slice";
import messagesReducer from './messagesSlice';

export const store = configureStore({
  reducer: {
    user: userInitialState,
    setNewChat: setNewChatReducer,
    messages: messagesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;