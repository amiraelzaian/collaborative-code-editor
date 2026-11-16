import { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";


export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60000,
            refetchOnWindowFocus: false,
            retry: (failureCount, err) => {
                if (isAxiosError(err) && err.response && err.response.status < 500) return false;
                return failureCount < 3
            }
        }
    }
})










