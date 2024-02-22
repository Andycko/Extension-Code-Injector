import axios from "axios";

export const clientsQueryOptions = {
    queryKey: ['clients'],
    queryFn: () =>
        axios
            .get('http://localhost:3333/clients')
            .then((res) => res.data),
}
