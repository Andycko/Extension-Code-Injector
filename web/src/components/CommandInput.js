import React, {useState} from 'react';
import {useMutation} from "@tanstack/react-query";
import {clientStore} from "../stores/clientStore";
import {sendCommandMutationOptions} from "../queries/sendCommandMutation";
import {
    Button,
    Card,
    CardHeader,
    Checkbox,
    CheckboxGroup,
    Divider,
    Select,
    SelectItem,
    Textarea
} from "@nextui-org/react";
import {scripts} from "../utils/scripts";

/**
 * `CommandInput` is a React component that allows the user to send commands to the server.
 *
 * It maintains two pieces of state:
 * - `targetSelected`: an array of targets where the command will be run.
 * - `scriptSelected`: the selected script to be run.
 *
 * It uses the `useMutation` hook from react-query to send the command to the server.
 * The status of the mutation (pending, fetching, or error) is used to determine the color of a status button.
 *
 * @example
 * return (
 *   <CommandInput />
 * )
 */
export default function CommandInput() {
    const [targetSelected, setTargetSelected] = useState([]);
    const [scriptSelected, setScriptSelected] = useState();

    const clients = clientStore((state) => state.clients);

    const {isPending, error, data, isFetching, mutate} = useMutation(sendCommandMutationOptions)

    const handleSubmit = (event) => {
        event.preventDefault();

        const body = {
            type: [],
            command: event.target.command.value,
            clients: clients.map(client => client.uid)
        }

        if (targetSelected.includes('background')) {
            body.type.push('BACKGROUND')
        }
        if (targetSelected.includes('contentScript')) {
            body.type.push('CONTENT-SCRIPT')
        }

        // send command
        mutate(body)
    };

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
                <h2 className="text-2xl text-bold">Send command</h2>
            </CardHeader>
            <Divider className="mb-3"/>
            <form onSubmit={handleSubmit} className="flex flex-col align-bottom gap-6 w-full">
                <Select
                    variant="flat"
                    label="Select a script"
                    selectionMode="single"
                    selectedKey={scriptSelected}
                    onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0]
                        setScriptSelected(selectedKey)
                        setTargetSelected(scripts.find((script) => script.handle === selectedKey)?.targets ?? [])
                    }
                    }
                    description={scripts.find((script) => script.handle === scriptSelected)?.description ?? "Select a pre-defined script to run, or enter your own command."}
                >
                    {scripts.map((script) => (
                        <SelectItem key={script.handle} value={script.handle}>
                            {script.name}
                        </SelectItem>
                    ))}
                </Select>
                <Textarea
                    isRequired
                    placeholder="Enter command"
                    name="command"
                    label="Command"
                    labelPlacement="outside"
                    size="lg"
                    fullwidth={true}
                    className="w-full"
                    value={scripts.find((script) => script.handle === scriptSelected)?.script}
                    minRows={6}
                />
                <div className="flex flex-row justify-between items-end">
                    <CheckboxGroup
                        label="Select where to run the command"
                        color="white"
                        value={targetSelected}
                        onValueChange={setTargetSelected}
                    >
                        <Checkbox color="success" value="background">Run in background</Checkbox>
                        <Checkbox color="success" value="contentScript">Run in content script</Checkbox>
                    </CheckboxGroup>
                    <Button color={setColor()} variant="ghost" type="submit" className="w-fit">{status()}</Button>
                </div>
            </form>
        </Card>
    );
}
