import axios from "axios";

export const screenshotsQueryOptions = {
    queryKey: ['screenshots'],
    queryFn: () =>
        axios
            .get(`${process.env.REACT_APP_API_URL}/collector/screenshots`)
            .then((res) => res.data),
}
