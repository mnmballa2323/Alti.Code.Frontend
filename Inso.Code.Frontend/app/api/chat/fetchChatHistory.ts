import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Define types for the responses
// type AiItem = {
//   _id: string;
//   prompt: string;
//   reply: string;
// };

type AiSession = {
  _id: string;
  userId?: string;
  conversationId?: string;
  title?: string;
  createdAt: string;
  // responses: AiItem[];
};

type ApiResponse = {
  success: boolean;
  data: {
    conversations: AiSession[];
  };
};

const useFetchResponses = (token: string | null, endpoint: string) => {
  const fetchResponses = async (): Promise<ApiResponse> => {
    const response = await axios.get<ApiResponse>(
      // `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}/get-response-from-db`,
      `${endpoint}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    // return response.data;
    return response.data;
  };

  const { data, isLoading, error, refetch } = useQuery<ApiResponse, Error>({
    queryKey: ["aiResponses", token, endpoint],
    queryFn: fetchResponses,
    enabled: !!token,
  });

  return {
    data: data?.data?.conversations || [],
    isLoading,
    error,
    refetch,
  };
};

export default useFetchResponses;
