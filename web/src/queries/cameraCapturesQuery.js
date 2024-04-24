import axios from "axios";

/**
 * @typedef {Object} QueryOptions
 * @property {Array<string>} queryKey - An array containing the unique key for the query.
 * @property {function(): Promise<any>} queryFn - A function that returns a promise which resolves with the data for the query.
 */

/**
 * The options for the camera captures query.
 *
 * This query is used to fetch camera captures from the server. The server endpoint is specified by the `REACT_APP_API_URL` environment variable.
 *
 * @type {QueryOptions}
 * @exports cameraCapturesQueryOptions
 */
export const cameraCapturesQueryOptions = {
    queryKey: ['cameraCaptures'],
    queryFn: () =>
        axios
            .get(`${process.env.REACT_APP_API_URL}/collector/camera`)
            .then((res) => res.data),
}
