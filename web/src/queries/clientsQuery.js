import axios from "axios";

export const clientsQueryOptions = {
    queryKey: ['clients'],
    queryFn: () =>
        axios
            .get(`${process.env.REACT_APP_API_URL}/clients`)
            .then((res) => res.data),
}
