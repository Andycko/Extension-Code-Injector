import React, {useState, useEffect } from 'react';
import {updateClients} from "../stores/clientStore";
import {clientsQueryOptions} from "../queries/clientsQuery";
import {useQuery} from "@tanstack/react-query";

export default function ClientList() {
    const [parsedClients, setParsedClients] = useState([]);

    const {isFetching, isPending, error, data} = useQuery(clientsQueryOptions);

    const status = () => {
        if (isPending) return 'Pending'
        if (isFetching) return 'Fetching'
        if (error) return 'Error'
        return
    }

    useEffect(() => {
        if (!data) return
        setParsedClients(data.map((client) => ({
                ...client,
                isSelected: false
            }
        )))
    }, [data]);


    return (
        <div className="client-list-wrapper">
            <h2>Connected clients {status() && `... ${status()}`}</h2>
            <div className="client-list">
                {parsedClients && parsedClients.map((client) => {
                    return (
                        <div key={client.uid} className="client">
                            <span className={`client-name ${client.isSelected ? 'text-green' : ''}`}>{client.uid}</span>
                            <span className={`client-name ${client.isSelected ? 'text-green' : ''}`}>{client.ip}</span>
                            <input type="checkbox" onChange={() => {
                                setParsedClients(parsedClients.map(c => {
                                    if (c.uid === client.uid) {
                                        c.isSelected = !c.isSelected
                                    }
                                    return c
                                }))
                                const selectedClients = parsedClients.filter(c => c.isSelected);
                                updateClients(selectedClients)
                            }}></input>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
