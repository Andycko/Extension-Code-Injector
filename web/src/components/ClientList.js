import React, {useState, useEffect } from 'react';
import {updateClients} from "../stores/clientStore";
import {clientsQueryOptions} from "../queries/clientsQuery";
import {useQuery} from "@tanstack/react-query";
import {
    Card,
    CardHeader,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from "@nextui-org/react";

export default function ClientList() {
    const [parsedClients, setParsedClients] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState(new Set([]));

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

    const updateSelected = (keys) => {
        setSelectedKeys(keys)
        const selectedClients = parsedClients.filter((client) => keys.has(client.uid))
        updateClients(selectedClients)
    }

    return (
        <Card className="client-list-wrapper px-4 pt-2 pb-4 w-full lg:w-auto">
            <CardHeader>
                <h2 className="text-2xl text-bold">Connected clients {status() && `... ${status()}`}</h2>
            </CardHeader>
            <Divider className="mb-3"/>
            <Table
                color="success"
                disallowEmptySelection
                selectionMode="multiple"
                selectedKeys={selectedKeys}
                onSelectionChange={updateSelected}
                shadow="none"
                className="min-w-80"
                aria-label="List of connected clients"
            >
                <TableHeader>
                    <TableColumn>ID</TableColumn>
                    <TableColumn>IP ADDRESS</TableColumn>
                </TableHeader>
                <TableBody emptyContent={"No rows to display."}>
                    {parsedClients && parsedClients.map((client) => {
                        return (
                            <TableRow key={client.uid}>
                                <TableCell>{client.uid}</TableCell>
                                <TableCell>{client.ip}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </Card>
    );
}
