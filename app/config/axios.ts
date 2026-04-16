import instance from 'axios'

const axios = instance.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
  withCredentials: true,
})

let isRefreshing = false

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        if (!isRefreshing) {
          isRefreshing = true
          await axios.post('/auth/refresh')
          isRefreshing = false
        }

        return axios(originalRequest)
      } catch (err) {
        isRefreshing = false
        window.location.href = '/login'
        return Promise.reject(err)
      }
    }

    if (error.response?.status === 403) {
      window.location.href = '/not-found'
    }


    return Promise.reject(error)
  }
)

export default axios