import axios from 'axios'

function getApiBaseUrl(): string {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, "")
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must be set in production")
  }

  return "http://localhost:8000/api/v1"
}

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
})

export const healthCheck = () => apiClient.get('/health')

export default apiClient
