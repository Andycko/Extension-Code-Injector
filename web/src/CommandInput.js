import React, {useState} from 'react';
import {useMutation} from "@tanstack/react-query";
import axios from "axios";

export default function CommandInput({clients}) {
    const {isPending, error, data, isFetching, mutate} = useMutation({
        mutationFn: (body) => {
            return axios
                .post(`http://localhost:3333/clients/send-command/`, body)
                .then((res) => res.data)
        },
    })

    const handleSubmit = (event) => {
        event.preventDefault();

        const body = {
            type: [],
            command: event.target.command.value,
            clients: clients.map(client => client.uid)
        }

        if (event.target.background.checked) {
            body.type.push('BACKGROUND')
        }
        if (event.target.contentScript.checked) {
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
        <div className="command-form-wrapper">
            <h2>Send command</h2>
            <form onSubmit={handleSubmit} className="command-form">
                <textarea
                    placeholder="Enter command"
                    name="command"
                />
                <div>
                    <input type="checkbox" name="background" />
                    <label htmlFor="type">Run in background</label>
                </div>
                <div>
                    <input type="checkbox" name="contentScript" />
                    <label htmlFor="type">Run in content script</label>
                </div>
                <button type="submit">SEND</button>
                Status: {status()}
            </form>
        </div>
    );
}
