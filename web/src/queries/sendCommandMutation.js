import axios from "axios";

export const sendCommandMutationOptions = {
    mutationFn: (body) => {
        return axios
            .post(`http://localhost:3333/clients/send-command/`, body)
            .then((res) => res.data)
    },
}
