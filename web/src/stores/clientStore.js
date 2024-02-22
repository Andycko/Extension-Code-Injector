import {create} from "zustand";

export const clientStore = create((set) => ({
    clients: [],
}))
export const updateClients = (clients) => clientStore.setState({clients: clients})
