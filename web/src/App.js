// App.js
import React, { useState } from 'react';
import ClientList from './ClientList';
import CommandInput from './CommandInput';
import {
    useQuery,
    QueryClient,
    QueryClientProvider, useQueryClient,
} from '@tanstack/react-query'
import axios from "axios";

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
    const [clients, setClients] = useState([]);

    const { isPending, error, data, isFetching } = useQuery({
        queryKey: ['clients'],
        queryFn: () =>
            axios
                .get('http://localhost:3333/clients')
                .then((res) => res.data),
    })

    if (error) console.error(error)

    if (data) {
        const parsedData = data.map((client) => ({
                ...client,
                isSelected: false
            }
        ))
        if (parsedData.length !== clients.length) {
            setClients(parsedData);
        }
    }

    return (
        <div className="main-wrapper">
            <h1>BotNet - Remote Command Execution</h1>
            <section className="body-wrapper">
                <ClientList clientsState={[clients, setClients]} />
                <CommandInput clients={clients} />
            </section>
        </div>
    );
}

export default QueryClientProviderWrapper;
