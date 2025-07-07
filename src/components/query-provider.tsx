'use client'
import { useState } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(
        () => 
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 5,
                        gcTime: 1000 * 60 * 30,
                        retry: 3,
                    },
                    mutations: {
                        retry: 1,
                    }
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    );
}

export default QueryProvider