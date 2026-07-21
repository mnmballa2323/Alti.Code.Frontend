"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode, useState } from "react";

// The QueryClient instance is created only on the client side
const ClientQueryProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            staleTime: 1000 * 60 * 10,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default ClientQueryProvider;
