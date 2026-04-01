import axios from "axios"

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback
  }
  const data = error.response?.data as
    | { detail?: string | Array<{ msg?: string } | string> }
    | undefined
  if (!data?.detail) {
    return fallback
  }
  if (typeof data.detail === "string") {
    return data.detail
  }
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((d) => (typeof d === "string" ? d : d.msg ?? ""))
      .filter(Boolean)
      .join(", ")
  }
  return fallback
}
