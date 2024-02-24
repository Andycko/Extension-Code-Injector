import React, {useState} from 'react';
import {useMutation} from "@tanstack/react-query";
import {clientStore} from "../stores/clientStore";
import {sendCommandMutationOptions} from "../queries/sendCommandMutation";
import {Button, Card, CardHeader, Checkbox, CheckboxGroup, Divider, Textarea} from "@nextui-org/react";

export default function CommandInput() {
    const [selected, setSelected] = useState([]);

    const clients = clientStore((state) => state.clients);

    const {isPending, error, data, isFetching, mutate} = useMutation(sendCommandMutationOptions)

    const handleSubmit = (event) => {
        event.preventDefault();

        const body = {
            type: [],
            command: event.target.command.value,
            clients: clients.map(client => client.uid)
        }

        if (selected.includes('background')) {
            body.type.push('BACKGROUND')
        }
        if (selected.includes('contentScript')) {
            body.type.push('CONTENT-SCRIPT')
        }

        // send command
        mutate(body)
    };

    const status = () => {
        if (isPending) return 'Pending'
        if (isFetching) return 'Fetching'
        if (error) return 'Error'
        if (data) return data
        return 'Idle'
    }

    return (
        <Card className="command-form-wrapper px-4 pt-2 pb-4 w-full lg:w-[30rem] xl:w-[35rem]">
            <CardHeader>
                <h2 className="text-2xl text-bold">Send command</h2>
            </CardHeader>
            <Divider className="mb-3"/>
            <form onSubmit={handleSubmit} className="flex flex-col gap-1">
                <Textarea
                    isRequired
                    placeholder="Enter command"
                    name="command"
                    label="Command"
                    labelPlacement="outside"
                    size="lg"
                    fullwidth={true}
                    className="mb-3"
                />
                <CheckboxGroup
                    label="Select where to run the command"
                    color="white"
                    value={selected}
                    onValueChange={setSelected}
                    className="mb-3"
                >
                    <Checkbox color="success" value="background">Run in background</Checkbox>
                    <Checkbox color="success" value="contentScript">Run in content script</Checkbox>
                </CheckboxGroup>
                <Button color="success" variant="ghost" type="submit" className="w-fit mb-5">SEND</Button>
                Status: {status()}
            </form>
        </Card>
    );
}
