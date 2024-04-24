import {create} from "zustand";

/**
 * @typedef {Object} Store
 * @property {Array<Object>} clients - An array to store client objects.
 */

/**
 * Creates a Zustand store for managing client data.
 *
 * The store has a single state property, `clients`, which is an array of client objects.
 *
 * @type {Store}
 * @exports clientStore
 */
export const clientStore = create((set) => ({
    clients: [],
}))
export const updateClients = (clients) => clientStore.setState({clients: clients})
