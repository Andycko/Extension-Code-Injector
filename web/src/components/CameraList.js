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
import ImageModal from "./ImageModal";

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
                    <TableColumn>CREATED AT</TableColumn>
                    <TableColumn>PREVIEW</TableColumn>
                </TableHeader>
                <TableBody emptyContent={"No rows to display."}>
                    {data && data.map((item) => {
                        return (
                            <TableRow key={item.name}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                                <TableCell>
                                    <ImageModal data={item}/>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </Card>
    );
}
