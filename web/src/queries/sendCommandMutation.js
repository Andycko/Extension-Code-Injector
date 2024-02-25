import axios from "axios";

export const sendCommandMutationOptions = {
    mutationFn: (body) => {
        return axios
            .post(`${process.env.REACT_APP_API_URL}/clients/send-command/`, body)
            .then((res) => res.data)
    },
}
