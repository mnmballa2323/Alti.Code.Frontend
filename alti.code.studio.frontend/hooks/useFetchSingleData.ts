import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type SearchResult = {
  title?: string;
  link?: string;
  snippet?: string;
  position?: number;
  _id?: string;
};

type AIModelItem = {
  _id?: string;
  model?: string;
  prompt?: string;
  reply?: string;
  search_results?: SearchResult[];
};

interface SessionData {
  _id: string;
  user: string;
  sessionId: string;
  responses: AIModelItem[];
  createdAt: string;
}

interface ApiResponse<T> {
  data: T;
}

const fetchSingleData = async (
  model: string,
  historyId: string,
  token: string,
): Promise<SessionData> => {
  const response = await axios.get<ApiResponse<SessionData>>(
    `${process.env.NEXT_PUBLIC_API_URL}/dyad/claude/get-response-by-sessionid/${historyId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data.data;
};

const useFetchSingleData = (
  model: string,
  historyId: string | undefined,
  token: string | null,
) => {
  const {
    data: chat,
    isLoading: singleLoading,
    error: singleError,
    refetch: singleRefetch,
  } = useQuery({
    queryKey: ["singleSession", model, historyId],
    queryFn: () => fetchSingleData(model, historyId || "", token as string),
    enabled: !!historyId && !!token,
  });

  return { chat, singleLoading, singleError, singleRefetch };
};

export default useFetchSingleData;
