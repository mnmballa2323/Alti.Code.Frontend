import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

import { RootState } from "./index";
import { useSettingsStore } from "@/store/useSettingsStore";

export interface ToolExecution {
  tool: string;
  args: any;
  status: "success" | "failed";
  result: any;
}

export interface MessageType {
  prompt?: string;
  reply?: string;
  toolExecutions?: ToolExecution[];
}

interface MessagesState {
  messages: MessageType[];
  sessionId: string | null;
  loading: boolean;
  error: string | null;
  model: string;

}

const initialState: MessagesState = {
  messages: [],
  sessionId: null,
  loading: false,
  error: null,
  model: "default",

};

interface SendMessagePayload {
  prompt: string;
  model: string;
  domain?: string;
  language?: string;
  sessionId: string | null;
  // user?: User;
  token: string | null;
  onFulfilled?: (newSessionId: string) => void;
}

interface ApiResponseData {
  sessionId: string;
  reply: string;
  toolExecutions?: ToolExecution[];
}

export const sendMessage = createAsyncThunk<
  ApiResponseData,
  SendMessagePayload,
  { rejectValue: string }
>(
  "messages/sendMessage",
  async (
    {
      prompt,
      model,
      domain,
      language,
      sessionId,
      token,
      onFulfilled,
    }: SendMessagePayload,
    { rejectWithValue, getState },
  ) => {
    try {
      const state = getState() as RootState;
      const activeRepos = state.system.repositories.filter((r) => r.isActive);

      let enrichedPrompt = prompt;

      if (activeRepos.length > 0) {
        const repoContext = activeRepos
          .map((r) => `- ${r.url} (License Required: ${r.licenseType})`)
          .join("\n");

        enrichedPrompt = `${prompt}\n\n[SYSTEM GUARDRAIL: When generating code or architectural solutions, you are authorized to pull logic, patterns, or packages from the following whitelisted repositories ONLY. You MUST ensure any utilized code strictly complies with the specified license requirements:\n${repoContext}]`;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/gemini/get-response`;

      const defaultModel = useSettingsStore.getState().defaultModel;
      const messagesModel = (getState() as RootState).messages.model;

      // 2. Build Payload
      const payload = {
        prompt: enrichedPrompt,
        mode: defaultModel || model || "gemini-3.1-pro",
        domain: messagesModel === "chat" ? "Chat" : domain,
        language: language,
        model: defaultModel || "gemini-3.1-pro",
        ...(sessionId ? { sessionId: sessionId } : {}),
      };

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        toolExecutions: data?.data?.toolExecutions || [],
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
        (error as Error).message || "Sorry, an unknown network error occurred.",
      );
    }
  },
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
      action: PayloadAction<{ sessionId: string | null; model: string }>,
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
    addMessage(state, action: PayloadAction<MessageType>) {
      state.messages.push(action.payload);
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
        const { reply, sessionId, toolExecutions } = action.payload;

        // Update the last message with the reply
        state.messages = state.messages.map((msg, index) =>
          index === state.messages.length - 1
            ? {
                ...msg,
                reply: reply || "Sorry, I couldn’t understand that.",
                toolExecutions,
              }
            : msg,
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
        // Instead of popping the user's message, we show the error as the assistant's reply
        state.messages = state.messages.map((msg, index) =>
          index === state.messages.length - 1
            ? { ...msg, reply: `Error: ${action.payload}` }
            : msg,
        );
      });
  },
});

export const { setMessages, setChatContext, startNewChat, addMessage } =
  messagesSlice.actions;

export default messagesSlice.reducer;
