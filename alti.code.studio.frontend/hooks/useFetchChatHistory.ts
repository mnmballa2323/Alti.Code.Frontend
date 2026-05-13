import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type AiItem = {
  _id: string;
  prompt: string;
  reply: string;
};

type AiSession = {
  _id: string;
  user?: string;
  sessionId?: string;
  createdAt: string;
  responses: AiItem[];
};

type ApiResponse = {
  success: boolean;
  data: {
    llamaAiSessions: AiSession[];
  };
};

const useFetchChatHistory = (token: string | null) => {
  const fetchResponses = async (): Promise<ApiResponse> => {
    const response = await axios.get<ApiResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/dyad/claude/get-response-from-db`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  };

  const { data, isLoading, error, refetch } = useQuery<ApiResponse, Error>({
    queryKey: ["aiResponses", token],
    queryFn: fetchResponses,
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes to eliminate UI lag
  });

  return {
    data: data?.data?.llamaAiSessions || [],
    isLoading,
    error,
    refetch,
  };
};

export default useFetchChatHistory;
