'use client'

/**
 * 超级管理页 /admin-panel
 * 写死密码校验（superadmin888），用于添加和删除 Owner 账号
 * Owner 账号可以登录 /admin 管理台，初始密码均为 888888
 */

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Plus, Trash2, ShieldAlert, Eye, EyeOff } from 'lucide-react'
import type { OwnerSummaryData } from '@/lib/admin-types'
import { fetchOwners, createOwner, deleteOwner } from '@/lib/admin-api'

const SUPER_ADMIN_PASSWORD = 'superadmin888'

export default function AdminPanelPage() {
  const [authed, setAuthed] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwError, setPwError] = useState(false)

  const [owners, setOwners] = useState<OwnerSummaryData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 添加表单
  const [showForm, setShowForm] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [creating, setCreating] = useState(false)
  const [usernameError, setUsernameError] = useState('')

  const loadOwners = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchOwners()
      setOwners(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) loadOwners()
  }, [authed, loadOwners])

  const handleLogin = () => {
    if (pwInput === SUPER_ADMIN_PASSWORD) {
      setAuthed(true)
      setPwError(false)
    } else {
      setPwError(true)
    }
  }

  const validateUsername = (v: string) => {
    if (!v) return '用户名不能为空'
    if (!/^[a-zA-Z0-9]+$/.test(v)) return '只能包含英文字母和数字'
    if (owners.some(o => o.username === v)) return '用户名已存在'
    return ''
  }

  const handleCreate = async () => {
    const err = validateUsername(newUsername)
    if (err) { setUsernameError(err); return }

    setCreating(true)
    try {
      await createOwner(newUsername)
      setNewUsername('')
      setShowForm(false)
      setUsernameError('')
      await loadOwners()
    } catch (e) {
      setUsernameError(e instanceof Error ? e.message : '创建失败')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`确认删除 Owner「${username}」？此操作不可恢复。`)) return
    try {
      await deleteOwner(id)
      await loadOwners()
    } catch (e) {
      setError(e instanceof Error ? e.message : '删除失败')
    }
  }

  // ── 密码验证页 ───────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <h1 className="text-lg font-semibold text-gray-800">超级管理</h1>
            <p className="text-xs text-gray-400 text-center">此页面仅限系统管理员使用</p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={pwInput}
                onChange={e => { setPwInput(e.target.value); setPwError(false) }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="请输入管理密码"
                className={[
                  'w-full border rounded-xl px-3 py-2.5 text-sm pr-10',
                  'focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400',
                  pwError ? 'border-red-400' : 'border-gray-300',
                ].join(' ')}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pwError && <p className="text-xs text-red-500">密码错误</p>}
            <button
              onClick={handleLogin}
              className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm
                         rounded-xl transition-colors font-medium"
            >
              进入管理
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── 管理界面 ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 标题 */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">超级管理 · Owner 账号</h1>
            <p className="text-xs text-gray-400">Owner 账号可登录 /admin 管理台，初始密码均为 888888</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        {/* 添加表单 */}
        {showForm ? (
          <div className="bg-white rounded-xl border border-blue-200 p-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">添加 Owner 账号</p>
            <div>
              <input
                value={newUsername}
                onChange={e => { setNewUsername(e.target.value); setUsernameError('') }}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="用户名（英文或数字）"
                className={[
                  'w-full border rounded-xl px-3 py-2 text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400',
                  usernameError ? 'border-red-400' : 'border-gray-300',
                ].join(' ')}
              />
              {usernameError && <p className="text-xs text-red-500 mt-1">{usernameError}</p>}
              <p className="text-xs text-gray-400 mt-1">初始密码：888888，登录后可在管理台修改</p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowForm(false); setNewUsername(''); setUsernameError('') }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600
                           text-white rounded-xl transition-colors disabled:opacity-60"
              >
                {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                创建
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50
                       rounded-xl border border-dashed border-blue-200 w-full transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加 Owner 账号
          </button>
        )}

        {/* Owner 列表 */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : owners.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">暂无 Owner 账号</p>
        ) : (
          <div className="space-y-2">
            {owners.map(owner => (
              <div
                key={owner.id}
                className="bg-white rounded-xl border border-gray-100 flex items-center gap-3 px-4 py-3"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center
                                text-sm font-medium text-blue-600 flex-shrink-0">
                  {(owner.username || owner.name || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{owner.username}</p>
                  {owner.name && owner.name !== owner.username && (
                    <p className="text-xs text-gray-400 truncate">{owner.name}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(owner.createdAt).toLocaleDateString('zh-CN')}
                </span>
                <button
                  onClick={() => handleDelete(owner.id, owner.username)}
                  className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
