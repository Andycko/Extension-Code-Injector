import React from 'react';
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
            <App />
        </QueryClientProvider>
    );
}

function App() {
    return (
        <div className="main-wrapper">
            <h1>BotNet - Remote Command Execution</h1>
            <section className="body-wrapper">
                <ClientList />
                <CommandInput />
            </section>
        </div>
    );
}

export default QueryClientProviderWrapper;
