import { configureStore } from "@reduxjs/toolkit";

import userInitialState from "./userSlice";
import setNewChatReducer from "./slice";
import messagesReducer from "./messagesSlice";
import shadowReducer from "./shadowSlice";
import systemReducer from "./systemSlice";
import uiReducer from "./uiSlice";
import tabsReducer from "./tabsSlice";
import teamReducer from "./teamSlice";
import ticketReducer from "./ticketSlice";

export const store = configureStore({
  reducer: {
    user: userInitialState,
    setNewChat: setNewChatReducer,
    messages: messagesReducer,
    shadow: shadowReducer,
    system: systemReducer,
    ui: uiReducer,
    tabs: tabsReducer,
    team: teamReducer,
    tickets: ticketReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
