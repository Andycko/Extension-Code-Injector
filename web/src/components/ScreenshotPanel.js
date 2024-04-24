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

/**
 * `ScreenshotPanel` is a React component that allows the user to capture screenshots.
 *
 * It maintains the following state:
 * - `isPending`: a boolean indicating whether the mutation is currently pending.
 * - `error`: any error that occurred during the mutation.
 * - `isFetching`: a boolean indicating whether the mutation is currently fetching.
 * - `mutate`: a function to perform the mutation.
 * - `clients`: an array of client data from the `clientStore`.
 *
 * It uses the `useMutation` hook from @tanstack/react-query to perform the mutation.
 * The `handleClick` function is used to handle the click event of the button, which triggers the mutation.
 * The `status` function is used to determine the status of the mutation.
 * The `setColor` function is used to determine the color of the button based on the status of the mutation.
 *
 * @example
 * return (
 *   <ScreenshotPanel />
 * )
 */
export default function ScreenshotPanel() {
    const {isPending, error, isFetching, mutate} = useMutation(sendCommandMutationOptions)

    const clients = clientStore((state) => state.clients);

    const handleClick = (_event) => {
        const body = {
            type: ['SCREENSHOT'],
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
                <h2 className="text-2xl text-bold">Capture screenshot</h2>
            </CardHeader>
            <Divider className="mb-3"/>
            <Button color={setColor()} variant="ghost" type="submit" className="w-fit self-end" onPress={handleClick}>{status()}</Button>
        </Card>
    );
}
