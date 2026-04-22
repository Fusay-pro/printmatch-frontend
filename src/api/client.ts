import axios from 'axios'

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const isLocalHttp = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(rawBaseURL)
const baseURL =
  import.meta.env.PROD && rawBaseURL.startsWith('http://') && !isLocalHttp
    ? rawBaseURL.replace(/^http:\/\//i, 'https://')
    : rawBaseURL

const client = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default client
