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
            <table className="client-list">
                <tbody>
                    <tr className="header-row">
                        <th>ID</th>
                        <th>IP Address</th>
                        <th>Selected</th>
                    </tr>
                    {parsedClients && parsedClients.map((client) => {
                        return (
                            <tr key={client.uid} className="client">
                                <td className={`client-name ${client.isSelected ? 'text-green' : ''}`}>{client.uid}</td>
                                <td className={`client-name ${client.isSelected ? 'text-green' : ''}`}>{client.ip}</td>
                                <td className="checkbox">
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
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
}
