import axios from "axios";

export const cameraCapturesQueryOptions = {
    queryKey: ['cameraCaptures'],
    queryFn: () =>
        axios
            .get(`${process.env.REACT_APP_API_URL}/collector/camera`)
            .then((res) => res.data),
}
