import axios from 'axios'

import { API_ROOT } from '~/utils/constants'

const axiosInstance = axios.create({
    baseURL: API_ROOT,
})

axiosInstance.interceptors.request.use(
    async (config) => {
        // TODO: using awt to get token here
        const token = null
        if (token) {
            config.headers['x-access-token'] = token
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

axiosInstance.interceptors.response.use(
    (res) => {
        return res
    },
    (err) => {
        if (err.response) {
            // Refresh Token was expired
        }

        return Promise.reject(err)
    },
)

export default axiosInstance
