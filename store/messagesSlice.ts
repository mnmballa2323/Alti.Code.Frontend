import type { RootState } from "./index";

import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

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
  ragPipeline?: any[];
}

interface MessagesState {
  messages: MessageType[];
  sessionId: string | null;
  loading: boolean;
  error: string | null;
  model: string;
  domain: string | null;
  isChatting: boolean;
}

const initialState: MessagesState = {
  messages: [],
  sessionId: null,
  loading: false,
  error: null,
  model: "default",
  domain: null,
  isChatting: false,
};

interface SendMessagePayload {
  prompt: string;
  model: string;
  domain?: string;
  language?: string;
  sessionId: string | null;
  token: string | null;
  ragMode?: "auto" | "forced" | "disabled";
  ragSources?: string[];
  onFulfilled?: (newSessionId: string) => void;
}

interface ApiResponseData {
  sessionId: string;
  reply: string;
  toolExecutions?: ToolExecution[];
  ragPipeline?: any[];
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
      ragMode,
      ragSources,
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

      const defaultModel = useSettingsStore.getState().defaultModel;
      const messagesModel = state.messages.model;
      const messagesDomain = state.messages.domain;

      const resolvedDomain =
        messagesDomain ||
        domain ||
        (messagesModel === "chat"
          ? "Chat"
          : messagesModel === "code"
            ? "Code"
            : messagesModel === "create"
              ? "Create"
              : messagesModel === "cowork"
                ? "Cowork"
                : "General");

      // Dynamically target dedicated isolated mode backend service
      const getModeBackendUrl = (modeDomain: string): string => {
        const base =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api/v1";
        const norm = modeDomain.toLowerCase();

        if (norm === "chat") return base.replace(/:\d+/, ":5001");
        if (norm === "code") return base.replace(/:\d+/, ":5002");
        if (norm === "create") return base.replace(/:\d+/, ":5003");
        if (norm === "cowork") return base.replace(/:\d+/, ":5004");

        return base;
      };

      const modeBackendApi = getModeBackendUrl(resolvedDomain);
      const apiUrl = `${modeBackendApi}/gemini/get-response`;

      // Build strictly isolated payload by domain and mode
      const payload = {
        prompt: enrichedPrompt,
        mode: messagesModel || model || "auto",
        domain: resolvedDomain,
        language: language,
        model: defaultModel || "auto",
        ...(sessionId ? { sessionId: sessionId } : {}),
        ragMode,
        ragSources,
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

      const responseData: ApiResponseData = {
        sessionId: data?.data?.sessionId || sessionId || "temp-session-id",
        reply: data?.data?.reply || "Sorry, I couldn’t understand that.",
        toolExecutions: data?.data?.toolExecutions || [],
        ragPipeline: data?.data?.ragPipeline || undefined,
      };

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
      action: PayloadAction<{
        sessionId: string | null;
        model: string;
        domain?: string;
      }>,
    ) {
      state.sessionId = action.payload.sessionId;
      state.model = action.payload.model;
      state.domain = action.payload.domain || action.payload.model;
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
        const { reply, sessionId, toolExecutions, ragPipeline } =
          action.payload;

        // Update the last message with the reply
        state.messages = state.messages.map((msg, index) =>
          index === state.messages.length - 1
            ? {
                ...msg,
                reply: reply || "Sorry, I couldn’t understand that.",
                toolExecutions,
                ragPipeline,
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
