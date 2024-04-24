import axios from "axios";

/**
 * @typedef {Object} MutationOptions
 * @property {function(Object): Promise<any>} mutationFn - A function that takes a body object as an argument and returns a promise which resolves with the data for the mutation.
 */

/**
 * The options for the send command mutation.
 *
 * This mutation is used to send commands to the server. The server endpoint is specified by the `REACT_APP_API_URL` environment variable.
 *
 * @type {MutationOptions}
 * @exports sendCommandMutationOptions
 */
export const sendCommandMutationOptions = {
    mutationFn: (body) => {
        return axios
            .post(`${process.env.REACT_APP_API_URL}/clients/send-command/`, body)
            .then((res) => res.data)
    },
}
