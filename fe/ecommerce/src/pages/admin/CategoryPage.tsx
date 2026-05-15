import { Folder, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState, type ChangeEvent } from 'react'
import {
  AdminBadge,
  AdminDrawer,
  AdminField,
  AdminInput,
  AdminPanel,
  AdminToolbar,
  slugifyAdminValue,
} from '../../components/admin/AdminUi'
import { useMarketStore } from '../../store/useMarketStore'
import type { AdminCategory, AdminCategoryStatus } from '../../types/admin'

const presetColors = ['#F7931A', '#c8a84b', '#ea580c', '#14b8a6', '#e879a8', '#94a3b8', '#22c55e']

type CategoryFormState = {
  name: string
  desc: string
  color: string
  status: AdminCategoryStatus
}

type ToastItem = {
  id: number
  type: 'success' | 'error'
  message: string
}

const defaultForm: CategoryFormState = {
  name: '',
  desc: '',
  color: presetColors[0],
  status: 'active',
}

function CategoryPage() {
  const categories = useMarketStore((state) => state.categories)
  const products = useMarketStore((state) => state.products)
  const addCategory = useMarketStore((state) => state.addCategory)
  const updateCategory = useMarketStore((state) => state.updateCategory)
  const deleteCategory = useMarketStore((state) => state.deleteCategory)

  const [search, setSearch] = useState('')
  const [panel, setPanel] = useState<AdminCategory | 'add' | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [form, setForm] = useState<CategoryFormState>(defaultForm)

  const pushToast = (type: ToastItem['type'], message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((current) => [...current, { id, type, message }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 2800)
  }

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) =>
        `${category.name} ${category.desc}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [categories, search],
  )

  const openAdd = () => {
    setForm(defaultForm)
    setPanel('add')
  }

  const openEdit = (category: AdminCategory) => {
    setForm({
      name: category.name,
      desc: category.desc,
      color: category.color,
      status: category.status,
    })
    setPanel(category)
  }

  const handleSave = async () => {
    if (isSaving) {
      return
    }

    if (!form.name.trim()) {
      pushToast('error', 'Vui lòng nhập tên danh mục.')
      return
    }

    if (!form.desc.trim()) {
      pushToast('error', 'Vui lòng nhập mô tả danh mục.')
      return
    }

    if (!form.color.trim()) {
      pushToast('error', 'Vui lòng chọn màu nhãn.')
      return
    }

    setIsSaving(true)

    const payload: AdminCategory = {
      id: panel === 'add' ? slugifyAdminValue(form.name) : panel!.id,
      name: form.name.trim(),
      slug: slugifyAdminValue(form.name),
      desc: form.desc.trim(),
      color: form.color,
      status: form.status,
    }

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 350))

      if (panel === 'add') {
        addCategory(payload)
        pushToast('success', 'Đã thêm danh mục.')
      } else if (panel) {
        updateCategory(payload)
        pushToast('success', 'Đã cập nhật danh mục.')
      }

      setPanel(null)
    } catch {
      pushToast('error', 'Không thể lưu danh mục. Vui lòng thử lại.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (category: AdminCategory) => {
    if (isDeletingId) {
      return
    }
    const count = products.filter((product) => product.category === category.name).length

    if (count > 0) {
      window.alert('Danh mục này còn sản phẩm. Hãy chuyển sản phẩm trước.')
      return
    }

    deleteCategory(category.id)
  }
  void handleDelete

  const handleDeleteWithFeedback = async (category: AdminCategory) => {
    if (isDeletingId) {
      return
    }

    const count = products.filter((product) => product.category === category.name).length
    if (count > 0) {
      pushToast('error', 'Danh mục này còn sản phẩm. Hãy chuyển sản phẩm trước.')
      return
    }

    setIsDeletingId(category.id)
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 250))
      deleteCategory(category.id)
      pushToast('success', 'Đã xóa danh mục.')
    } catch {
      pushToast('error', 'Không thể xóa danh mục. Vui lòng thử lại.')
    } finally {
      setIsDeletingId(null)
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="pointer-events-none fixed right-5 top-5 z-[70] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-[14px] border px-4 py-3 text-sm shadow-[0_16px_40px_rgba(0,0,0,0.28)] backdrop-blur ${
              toast.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/12 text-emerald-100'
                : 'border-red-500/30 bg-red-500/12 text-red-100'
            }`}
          >
            <div className="font-semibold">
              {toast.type === 'success' ? 'Thành công' : 'Có lỗi xảy ra'}
            </div>
            <div className="mt-1 text-[13px] opacity-90">{toast.message}</div>
          </div>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminToolbar
          right={
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-r from-[#ea580c] to-[#f7931a] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_18px_-8px_rgba(247,147,26,0.7)]"
            >
              <Plus size={15} strokeWidth={2.2} />
              Thêm danh mục
            </button>
          }
        >
          <div className="flex w-full max-w-[330px] items-center gap-2 rounded-[10px] border border-[#3a3530] bg-[#111] px-3 py-2.5">
            <Search size={15} className="text-[#7a7570]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm danh mục..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#5f5a55]"
            />
          </div>
        </AdminToolbar>

        <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
          <AdminPanel className="overflow-hidden">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr className="bg-black/10 text-[11px] uppercase tracking-[0.22em] text-[#7a7570]">
                  <th className="px-7 py-4 font-medium">Danh mục</th>
                  <th className="px-7 py-4 font-medium">Sản phẩm</th>
                  <th className="px-7 py-4 font-medium">Trạng thái</th>
                  <th className="px-7 py-4 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => {
                  const productCount = products.filter(
                    (product) => product.category === category.name,
                  ).length

                  return (
                    <tr
                      key={category.id}
                      className="border-t border-[#2e2a24] transition hover:bg-white/[0.025]"
                    >
                      <td className="px-7 py-5">
                        <div className="flex items-center gap-4">
                          <div
                            className="flex h-11 w-11 items-center justify-center rounded-xl border"
                            style={{
                              backgroundColor: `${category.color}20`,
                              borderColor: `${category.color}55`,
                              color: category.color,
                            }}
                          >
                            <Folder size={18} strokeWidth={1.9} />
                          </div>
                          <div>
                            <div className="text-[1.02rem] font-semibold text-white">
                              {category.name}
                            </div>
                            <div className="mt-1 text-sm text-[#7a7570]">{category.desc}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-7 py-5">
                        <span className="inline-flex rounded-full border border-[#704514] bg-[#f7931a]/10 px-3 py-1 text-xs font-bold text-[#f7931a]">
                          {productCount}
                        </span>
                      </td>
                      <td className="px-7 py-5">
                        <AdminBadge status={category.status} />
                      </td>
                      <td className="px-7 py-5">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(category)}
                            className="inline-flex items-center gap-1 rounded-[8px] border border-[#3a3530] px-3 py-1.5 text-xs text-[#9b958e] transition hover:text-white"
                          >
                            <Pencil size={13} />
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              void handleDeleteWithFeedback(category)
                            }}
                            disabled={isDeletingId === category.id}
                            className="inline-flex items-center gap-1 rounded-[8px] border border-red-500/25 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/8 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 size={13} />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </AdminPanel>
        </div>
      </div>

      {panel ? (
        <AdminDrawer
          title={panel === 'add' ? 'Thêm danh mục' : 'Sửa danh mục'}
          onClose={() => {
            if (!isSaving) {
              setPanel(null)
            }
          }}
          onSave={() => {
            void handleSave()
          }}
          saveLabel={isSaving ? 'Đang lưu...' : 'Lưu'}
        >
          <AdminField label="Tên danh mục">
            <AdminInput
              value={form.name}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="VD: Áo thun"
            />
          </AdminField>

          <AdminField label="Mô tả">
            <AdminInput
              as="textarea"
              value={form.desc}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                setForm((current) => ({ ...current, desc: event.target.value }))
              }
              placeholder="Mô tả ngắn..."
            />
          </AdminField>

          <AdminField label="Màu nhãn">
            <div className="flex flex-wrap gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, color }))}
                  className="h-7 w-7 rounded-full border-2 transition"
                  style={{
                    backgroundColor: color,
                    borderColor: form.color === color ? '#fff' : 'transparent',
                    outline: form.color === color ? `2px solid ${color}` : 'none',
                    outlineOffset: '2px',
                  }}
                  aria-label={`Chọn màu ${color}`}
                />
              ))}
            </div>
          </AdminField>

          <AdminField label="Trạng thái">
            <AdminInput
              as="select"
              value={form.status}
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as AdminCategoryStatus,
                }))
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </AdminInput>
          </AdminField>
        </AdminDrawer>
      ) : null}
    </div>
  )
}

export default CategoryPage
