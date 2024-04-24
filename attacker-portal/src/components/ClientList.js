import React, {useState, useEffect } from 'react';
import {updateClients} from "../stores/clientStore";
import {clientsQueryOptions} from "../queries/clientsQuery";
import {useQuery} from "@tanstack/react-query";
import {
    Button,
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

/**
 * `ClientList` is a React component that displays a list of connected clients.
 *
 * It maintains two pieces of state:
 * - `parsedClients`: an array of client objects, each with an `isSelected` property.
 * - `selectedKeys`: a Set of keys corresponding to the selected clients.
 *
 * It uses the `useQuery` hook from react-query to fetch the clients data from the server.
 * The status of the query (pending, fetching, or refresh) is used to determine the color of a status button.
 *
 * When the `data` from the query changes, it updates `parsedClients` with the new data.
 *
 * @example
 * return (
 *   <ClientList />
 * )
 */
export default function ClientList() {
    const [parsedClients, setParsedClients] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState(new Set([]));

    const {isFetching, isPending, data, refetch} = useQuery(clientsQueryOptions);

    const status = () => {
        if (isPending) return 'Pending'
        if (isFetching) return 'Fetching'
        return 'Refresh'
    }

    const setColor = () => {
        if (status() === 'Pending') return 'warning'
        if (status() === 'Fetching') return 'warning'
        return 'success'
    }

    // useEffect required to update the parsedClients state when the data changes
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
        <Card className="px-4 pt-2 pb-4 w-full h-full flex-1">
            <CardHeader className="flex flex-row justify-between">
                <h2 className="text-2xl text-bold">Connected clients</h2>
                <Button color={setColor()} onClick={refetch} size="sm" isDisabled={status() !== 'Refresh'}>{status()}</Button>
            </CardHeader>
            <Divider className="mb-3"/>
            <Table
                color="success"
                disallowEmptySelection
                selectionMode="multiple"
                selectedKeys={selectedKeys}
                onSelectionChange={updateSelected}
                shadow="none"
                className="w-full"
                aria-label="List of connected clients"
            >
                <TableHeader>
                    <TableColumn>ID</TableColumn>
                    <TableColumn>IP ADDRESS</TableColumn>
                    <TableColumn>COUNTRY</TableColumn>
                    <TableColumn>CITY</TableColumn>
                    <TableColumn>ZIP CODE</TableColumn>
                </TableHeader>
                <TableBody emptyContent={"No rows to display."}>
                    {parsedClients && parsedClients.map((client) => {
                        return (
                            <TableRow key={client.uid}>
                                <TableCell>{client.uid}</TableCell>
                                <TableCell>{client.ip}</TableCell>
                                <TableCell>{client.address.country}</TableCell>
                                <TableCell>{client.address.city}</TableCell>
                                <TableCell>{client.address.zip}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </Card>
    );
}
