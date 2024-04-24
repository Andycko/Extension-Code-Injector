import axios from "axios";

/**
 * @typedef {Object} QueryOptions
 * @property {Array<string>} queryKey - An array containing the unique key for the query.
 * @property {function(): Promise<any>} queryFn - A function that returns a promise which resolves with the data for the query.
 */

/**
 * The options for the clients query.
 *
 * This query is used to fetch clients from the server. The server endpoint is specified by the `REACT_APP_API_URL` environment variable.
 *
 * @type {QueryOptions}
 * @exports clientsQueryOptions
 */
export const clientsQueryOptions = {
    queryKey: ['clients'],
    queryFn: () =>
        axios
            .get(`${process.env.REACT_APP_API_URL}/clients`)
            .then((res) => res.data),
}
