import React from 'react';
import {useQuery} from "@tanstack/react-query";
import {
    Button,
    Card,
    CardHeader,
    Divider, Link,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from "@nextui-org/react";
import * as dayjs from 'dayjs'
import {cameraCapturesQueryOptions} from "../queries/cameraCapturesQuery";

export default function CameraList() {
    const {isFetching, isPending, data, refetch} = useQuery(cameraCapturesQueryOptions);

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

    return (
        <Card className="px-4 pt-2 pb-4 w-full h-full flex-1">
            <CardHeader className="flex flex-row justify-between">
                <h2 className="text-2xl text-bold">Captured Images from Camera</h2>
                <Button color={setColor()} onClick={refetch} size="sm" isDisabled={status() !== 'Refresh'}>{status()}</Button>
            </CardHeader>
            <Divider className="mb-3"/>
            <Table
                color="success"
                shadow="none"
                className="w-full"
                aria-label="List of screenshots captured"
            >
                <TableHeader>
                    <TableColumn>NAME</TableColumn>
                    <TableColumn>URL</TableColumn>
                    <TableColumn>CREATED AT</TableColumn>
                </TableHeader>
                <TableBody emptyContent={"No rows to display."}>
                    {data && data.map((image) => {
                        return (
                            <TableRow key={image.uid}>
                                <TableCell>{image.name}</TableCell>
                                <TableCell>
                                    <Link href={image.url} color="success">Download!</Link>
                                </TableCell>
                                <TableCell>{dayjs(image.createdAt).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </Card>
    );
}
