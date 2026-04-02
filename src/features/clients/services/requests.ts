import { api } from "@/features/shared/services/client"

import type {
  ClientCreate,
  ClientListPage,
  ClientRead,
  ClientUpdate,
  ListClientsParams,
} from "./types"

export async function listClients(
  params?: ListClientsParams,
): Promise<ClientListPage> {
  const { data } = await api.get<ClientListPage>("/library/clients", {
    params,
  })
  return data
}

export async function createClient(payload: ClientCreate): Promise<ClientRead> {
  const { data } = await api.post<ClientRead>("/library/clients", payload)
  return data
}

export async function getClient(clientId: number): Promise<ClientRead> {
  const { data } = await api.get<ClientRead>(`/library/clients/${clientId}`)
  return data
}

export async function updateClient(
  clientId: number,
  payload: ClientUpdate,
): Promise<ClientRead> {
  const { data } = await api.patch<ClientRead>(
    `/library/clients/${clientId}`,
    payload,
  )
  return data
}

export async function deleteClient(clientId: number): Promise<void> {
  await api.delete(`/library/clients/${clientId}`)
}
