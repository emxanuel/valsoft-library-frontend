export type ClientRead = {
  id: number
  name: string
  email: string
  phone: string | null
  created_at: string
  updated_at: string
}

export type ClientCreate = {
  name: string
  email: string
  phone?: string | null
}

export type ClientUpdate = {
  name?: string | null
  email?: string | null
  phone?: string | null
}

export type ClientListPage = {
  items: ClientRead[]
  total: number
  limit: number
  offset: number
}

export type ListClientsParams = {
  q?: string
  offset?: number
  limit?: number
}
