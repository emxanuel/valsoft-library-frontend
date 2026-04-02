export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  apiBaseUrlWs: import.meta.env.VITE_API_BASE_URL_WS || "ws://localhost:8000",
}