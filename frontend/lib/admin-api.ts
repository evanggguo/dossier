/**
 * 管理端 API 请求封装
 * 所有请求自动携带 JWT Bearer Token，401 时清除 token 并跳转登录
 */

import type {
  OwnerProfileData,
  UpdateOwnerData,
  SuggestionData,
  CreateSuggestionData,
  UpdateSuggestionData,
  KnowledgeData,
  CreateKnowledgeData,
  UpdateKnowledgeData,
  DocumentData,
  OwnerSummaryData,
} from './admin-types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

function getToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token') || ''
  }
  return ''
}

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    },
  })

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token')
      window.location.href = '/admin/login'
    }
    throw new Error('Unauthorized. Please log in again.')
  }

  if (res.status === 204) {
    return undefined as T
  }

  const body = await res.json()
  if (!body.success) {
    throw new Error(body.message || 'Request failed')
  }
  return body.data as T
}

// ── 认证 ──────────────────────────────────────────────────────────

export async function adminLogin(
  username: string,
  password: string
): Promise<{ token: string; tokenType: string }> {
  const res = await fetch(`${API_BASE}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const body = await res.json()
  if (!body.success) throw new Error(body.message || 'Login failed')
  return body.data
}

// ── Owner 信息 ────────────────────────────────────────────────────

export const fetchAdminProfile = (): Promise<OwnerProfileData> =>
  adminFetch<OwnerProfileData>('/api/admin/owner/profile')

export const updateAdminProfile = (data: UpdateOwnerData): Promise<OwnerProfileData> =>
  adminFetch<OwnerProfileData>('/api/admin/owner/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })

// ── 提示词 ────────────────────────────────────────────────────────

export const fetchSuggestions = (): Promise<SuggestionData[]> =>
  adminFetch<SuggestionData[]>('/api/admin/suggestions')

export const createSuggestion = (data: CreateSuggestionData): Promise<SuggestionData> =>
  adminFetch<SuggestionData>('/api/admin/suggestions', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateSuggestion = (id: number, data: UpdateSuggestionData): Promise<SuggestionData> =>
  adminFetch<SuggestionData>(`/api/admin/suggestions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const deleteSuggestion = (id: number): Promise<void> =>
  adminFetch<void>(`/api/admin/suggestions/${id}`, { method: 'DELETE' })

// ── 知识库 ────────────────────────────────────────────────────────

export const fetchKnowledge = (): Promise<KnowledgeData[]> =>
  adminFetch<KnowledgeData[]>('/api/admin/knowledge')

export const createKnowledge = (data: CreateKnowledgeData): Promise<KnowledgeData> =>
  adminFetch<KnowledgeData>('/api/admin/knowledge', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateKnowledge = (id: number, data: UpdateKnowledgeData): Promise<KnowledgeData> =>
  adminFetch<KnowledgeData>(`/api/admin/knowledge/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const deleteKnowledge = (id: number): Promise<void> =>
  adminFetch<void>(`/api/admin/knowledge/${id}`, { method: 'DELETE' })

// ── Owner 账号管理（修改用户名/密码） ──────────────────────────────

export const changeUsername = (newUsername: string): Promise<void> =>
  adminFetch<void>('/api/admin/owner/username', {
    method: 'PUT',
    body: JSON.stringify({ newUsername }),
  })

export const changePassword = (oldPassword: string, newPassword: string): Promise<void> =>
  adminFetch<void>('/api/admin/owner/password', {
    method: 'PUT',
    body: JSON.stringify({ oldPassword, newPassword }),
  })

// ── 超级管理（owner 账号增删，使用写死密码头） ──────────────────────

const SUPER_ADMIN_PASSWORD = 'superadmin888'

async function superAdminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Super-Admin-Token': SUPER_ADMIN_PASSWORD,
      ...(options.headers as Record<string, string>),
    },
  })

  if (res.status === 204) return undefined as T

  const body = await res.json()
  if (!body.success) throw new Error(body.message || 'Request failed')
  return body.data as T
}

export const fetchOwners = (): Promise<OwnerSummaryData[]> =>
  superAdminFetch<OwnerSummaryData[]>('/api/super-admin/owners')

export const createOwner = (username: string): Promise<OwnerSummaryData> =>
  superAdminFetch<OwnerSummaryData>('/api/super-admin/owners', {
    method: 'POST',
    body: JSON.stringify({ username }),
  })

export const deleteOwner = (id: number): Promise<void> =>
  superAdminFetch<void>(`/api/super-admin/owners/${id}`, { method: 'DELETE' })

// ── 文档管理 ──────────────────────────────────────────────────────

export const fetchDocuments = (): Promise<DocumentData[]> =>
  adminFetch<DocumentData[]>('/api/admin/documents')

export async function uploadDocument(file: File): Promise<DocumentData> {
  const token = getToken()
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/api/admin/documents/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token')
      window.location.href = '/admin/login'
    }
    throw new Error('Unauthorized. Please log in again.')
  }

  const body = await res.json()
  if (!body.success) throw new Error(body.message || 'Upload failed')
  return body.data
}

export const processDocument = (id: number): Promise<DocumentData> =>
  adminFetch<DocumentData>(`/api/admin/documents/${id}/process`, { method: 'POST' })

export const deleteDocument = (id: number): Promise<void> =>
  adminFetch<void>(`/api/admin/documents/${id}`, { method: 'DELETE' })
