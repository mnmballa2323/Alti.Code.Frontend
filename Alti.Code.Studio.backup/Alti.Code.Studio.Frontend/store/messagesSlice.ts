import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

export interface MessageType {
  prompt?: string;
  reply?: string;
}

interface User {
  email?: string;
  _id?: string;
}

interface MessagesState {
  messages: MessageType[];
  sessionId: string | null;
  loading: boolean;
  isChatting: boolean;
  error: string | null;
  model: string;
}

const initialState: MessagesState = {
  messages: [],
  sessionId: null,
  loading: false,
  isChatting: false,
  error: null,
  model: "default",
};

interface SendMessagePayload {
  prompt: string;
  model: string;
  sessionId: string | null;
  // user?: User;
  token: string | null;
  onFulfilled?: (newSessionId: string) => void;
}

interface ApiResponseData {
  sessionId: string;
  reply: string;
}

export const sendMessage = createAsyncThunk<
  ApiResponseData,
  SendMessagePayload,
  { rejectValue: string }
>(
  "messages/sendMessage",
  async (
    { prompt, model, sessionId, token, onFulfilled }: SendMessagePayload,
    { rejectWithValue }
  ) => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/dyad/claude/get-response`;

      // 2. Build Payload
      const payload = {
        // userId: "68e5779e645618133a0dcb18",
        prompt: prompt,
        ...(sessionId ? { sessionId: sessionId } : {}),
      };

      console.log({ payload });

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Server error: ${res.status}`);
      }

      if (data?.success !== true) {
        throw new Error(data.message || "Failed to get AI response.");
      }

      // 6. Return the required data structure to the fulfilled action
      const responseData: ApiResponseData = {
        sessionId: data?.data?.sessionId || sessionId || "temp-session-id",
        reply: data?.data?.reply || "Sorry, I couldn’t understand that.",
      };

      // 💡 Check if a new session was created (was null before, is a string now)
      if (
        !sessionId &&
        responseData.sessionId &&
        responseData.sessionId !== "temp-session-id"
      ) {
        onFulfilled?.(responseData.sessionId);
      }

      return responseData;
    } catch (error) {
      console.error("Error in sendMessage thunk:", error);
      return rejectWithValue(
        (error as Error).message || "Sorry, an unknown network error occurred."
      );
    }
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setMessages(state, action: PayloadAction<MessageType[]>) {
      state.messages = action.payload;
    },
    setChatContext(
      state,
      action: PayloadAction<{ sessionId: string | null; model: string }>
    ) {
      state.sessionId = action.payload.sessionId;
      state.model = action.payload.model;
      state.isChatting = action.payload.sessionId !== null;
    },
    startNewChat(state) {
      state.messages = [];
      state.sessionId = null;
      state.isChatting = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.isChatting = true;

        const { prompt } = action.meta.arg;
        state.messages.push({ prompt });
      })
      // Handle AI response
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        const { reply, sessionId } = action.payload;

        // Update the last message with the reply
        state.messages = state.messages.map((msg, index) =>
          index === state.messages.length - 1
            ? { ...msg, reply: reply || "Sorry, I couldn’t understand that." }
            : msg
        );

        // Update sessionId if a new one was created
        if (sessionId && sessionId !== state.sessionId) {
          state.sessionId = sessionId;
        }
      })
      // Handle errors
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.messages.pop();
      });
  },
});

export const { setMessages, setChatContext, startNewChat } =
  messagesSlice.actions;

export default messagesSlice.reducer;
