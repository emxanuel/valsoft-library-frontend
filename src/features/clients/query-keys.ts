import type { ListClientsParams } from "@/features/clients/services/types"

export const clientsKeys = {
  clients: (params?: ListClientsParams) =>
    [
      "library",
      "clients",
      params?.q ?? null,
      params?.offset ?? 0,
      params?.limit ?? 20,
    ] as const,
  client: (id: number) => ["library", "clients", id] as const,
}
