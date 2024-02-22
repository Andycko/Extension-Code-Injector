import React from 'react';

export default function ClientList({ clientsState }) {

    const [clients, setClients] = clientsState

    return (
        <div className="client-list-wrapper">
            <h2>Connected clients</h2>
            <div className="client-list">
                {clients.map((client) => {
                    return (
                        <div key={client.uid} className="client">
                            <span className={`client-name ${client.isSelected ? 'text-green' : ''}`}>{client.uid}</span>
                            <span className={`client-name ${client.isSelected ? 'text-green' : ''}`}>{client.ip}</span>
                            <input type="checkbox" onChange={() => {
                                const updatedClients = clients.map(c => {
                                    if (c === client) {
                                        return {...c, isSelected: !c.isSelected};
                                    }
                                    return c;
                                });
                                setClients(updatedClients);
                            }}></input>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
