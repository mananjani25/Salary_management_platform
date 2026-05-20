import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
})

export const healthCheck = () => apiClient.get('/health')

export default apiClient
