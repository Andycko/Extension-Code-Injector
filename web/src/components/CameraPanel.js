import {
    Button,
    Card,
    CardHeader,
    Divider,
} from "@nextui-org/react";
import React from "react";
import {useMutation} from "@tanstack/react-query";
import {sendCommandMutationOptions} from "../queries/sendCommandMutation";
import {clientStore} from "../stores/clientStore";

export default function CameraPanel() {
    const {isPending, error, isFetching, mutate} = useMutation(sendCommandMutationOptions)

    const clients = clientStore((state) => state.clients);

    const handleClick = (_event) => {
        const body = {
            type: ['CAMERA'],
            command: null,
            clients: clients.map(client => client.uid)
        }
        mutate(body)
    }

    const status = () => {
        if (isPending) return 'Pending'
        if (isFetching) return 'Fetching'
        if (error) return 'Error'
        return 'Send'
    }

    const setColor = () => {
        if (status() === 'Pending') return 'warning'
        if (status() === 'Fetching') return 'warning'
        if (status() === 'Error') return 'danger'
        return 'success'
    }

    return (
        <Card className="mb-5 px-4 pt-2 pb-4 w-full">
            <CardHeader>
                <h2 className="text-2xl text-bold">Capture image with camera</h2>
            </CardHeader>
            <Divider className="mb-3"/>
            <Button color={setColor()} variant="ghost" type="submit" className="w-fit self-end" onPress={handleClick}>{status()}</Button>
        </Card>
    );
}
