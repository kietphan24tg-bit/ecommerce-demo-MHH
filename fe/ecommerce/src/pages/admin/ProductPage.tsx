import { ImagePlus, Pencil, Plus, Search, Trash2, Upload, X } from 'lucide-react'
import { useMemo, useState, type ChangeEvent } from 'react'
import { createProductImage, createProductMockData } from '../../data/market'
import { cn } from '../../lib/utils'
import {
  AdminBadge,
  AdminDrawer,
  AdminField,
  AdminInput,
  AdminPanel,
  AdminToolbar,
  createAdminProductId,
  formatAdminCurrency,
} from '../../components/admin/AdminUi'
import { useMarketStore } from '../../store/useMarketStore'
import type { Product } from '../../types/product'

type ProductFormState = {
  name: string
  image: string
  gallery: string
  category: string
  originalPrice: string
  discountPercent: string
  country: string
  rating: string
  status: 'active' | 'inactive'
  inStock: boolean
  description: string
  sizes: string
  colors: string
  sizeGuide: string
}

type ToastItem = {
  id: number
  type: 'success' | 'error'
  message: string
}

const colorPresets: Product['colors'] = [
  { name: 'Kem vani', hex: '#dcc7a1' },
  { name: 'Den onyx', hex: '#18181b' },
  { name: 'Nau dat', hex: '#8b5e34' },
  { name: 'Xanh reu', hex: '#2f6b55' },
  { name: 'Trang suong', hex: '#e7e5e4' },
  { name: 'Xanh cobalt', hex: '#2d5bd1' },
  { name: 'Do gac', hex: '#b91c1c' },
  { name: 'Vang dat', hex: '#f4b321' },
]

function getDiscountPercent(product: Pick<Product, 'cost' | 'originalPrice'>) {
  if (!product.originalPrice || product.originalPrice <= 0) {
    return '0'
  }

  return String(Math.round((1 - product.cost / product.originalPrice) * 100))
}

function getComputedSalePrice(originalPrice: string, discountPercent: string) {
  const basePrice = Number(originalPrice)
  const discount = Number(discountPercent || '0')

  if (!Number.isFinite(basePrice) || basePrice < 0) {
    return null
  }

  if (!Number.isFinite(discount) || discount < 0 || discount >= 100) {
    return null
  }

  return Math.round(basePrice * (1 - discount / 100))
}

function normalizeDiscountPercent(value: string) {
  const normalizedValue = value.trim()
  if (!normalizedValue) {
    return '0'
  }

  const parsedValue = Number(normalizedValue)
  if (!Number.isFinite(parsedValue)) {
    return '0'
  }

  return String(parsedValue)
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function splitCommaSeparatedLines(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function splitLineSeparatedValues(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function stringifyColorLines(colors: Product['colors']) {
  return colors.map((color) => `${color.name}|${color.hex}`).join('\n')
}

function parseColorLines(value: string, fallback: Product['colors']) {
  const parsed = value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, hex] = line.split('|').map((part) => part.trim())
      if (!name || !hex) {
        return null
      }

      return { name, hex }
    })
    .filter((item): item is Product['colors'][number] => item !== null)

  return parsed.length > 0 ? parsed : fallback
}

function ProductPage() {
  const products = useMarketStore((state) => state.products)
  const categories = useMarketStore((state) => state.categories)
  const countryOptions = useMarketStore((state) => state.countryOptions)
  const addProduct = useMarketStore((state) => state.addProduct)
  const updateProduct = useMarketStore((state) => state.updateProduct)
  const deleteProduct = useMarketStore((state) => state.deleteProduct)

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [panel, setPanel] = useState<Product | 'add' | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [colorDraftName, setColorDraftName] = useState('')
  const [colorDraftHex, setColorDraftHex] = useState('#dcc7a1')
  const [form, setForm] = useState<ProductFormState>({
    name: '',
    image: '',
    gallery: '',
    category: '',
    originalPrice: '',
    discountPercent: '0',
    country: 'Vietnam',
    rating: '0',
    status: 'active',
    inStock: true,
    description: '',
    sizes: '',
    colors: '',
    sizeGuide: '',
  })

  const pushToast = (type: ToastItem['type'], message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((current) => [...current, { id, type, message }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 2800)
  }

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory
        const matchesStatus =
          filterStatus === 'all' || (product.status ?? 'active') === filterStatus

        return matchesSearch && matchesCategory && matchesStatus
      }),
    [filterCategory, filterStatus, products, search],
  )

  const previewCost = getComputedSalePrice(
    form.originalPrice,
    normalizeDiscountPercent(form.discountPercent),
  )
  const previewImage = form.image.trim()
  const galleryImages = useMemo(() => splitLineSeparatedValues(form.gallery), [form.gallery])
  const selectedColors = useMemo(() => parseColorLines(form.colors, []), [form.colors])

  const openAdd = () => {
    setColorDraftName('')
    setColorDraftHex('#dcc7a1')
    setForm({
      name: '',
      image: '',
      gallery: '',
      category: categories[0]?.name ?? '',
      originalPrice: '',
      discountPercent: '0',
      country: 'Vietnam',
      rating: '0',
      status: 'active',
      inStock: true,
      description: '',
      sizes: '',
      colors: '',
      sizeGuide: '',
    })
    setPanel('add')
  }

  const openEdit = (product: Product) => {
    setColorDraftName('')
    setColorDraftHex(product.colors[0]?.hex ?? '#dcc7a1')
    setForm({
      name: product.name,
      image: product.image,
      gallery: product.images.join('\n'),
      category: product.category,
      originalPrice: String(product.originalPrice ?? product.cost),
      discountPercent: getDiscountPercent(product),
      country: product.country,
      rating: String(product.rating),
      status: product.status ?? 'active',
      inStock: product.inStock !== false,
      description: product.description,
      sizes: product.sizes.join(', '),
      colors: stringifyColorLines(product.colors),
      sizeGuide: product.sizeGuide,
    })
    setPanel(product)
  }

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const image = await readFileAsDataUrl(file)
      if (!image) {
        pushToast('error', 'Không đọc được ảnh sản phẩm.')
        return
      }

      setForm((current) => ({ ...current, image }))
      pushToast('success', 'Đã tải ảnh sản phẩm.')
    } catch {
      pushToast('error', 'Tải ảnh sản phẩm thất bại.')
    }
    event.target.value = ''
  }

  const handleGalleryUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) {
      return
    }

    try {
      const uploadedImages = (
        await Promise.all(files.map((file) => readFileAsDataUrl(file)))
      ).filter(Boolean)

      if (uploadedImages.length === 0) {
        pushToast('error', 'Không đọc được ảnh gallery.')
        event.target.value = ''
        return
      }

      setForm((current) => {
        const nextGallery = [...splitLineSeparatedValues(current.gallery), ...uploadedImages]
        return { ...current, gallery: nextGallery.join('\n') }
      })
      pushToast('success', `Đã thêm ${uploadedImages.length} ảnh gallery.`)
    } catch {
      pushToast('error', 'Tải ảnh gallery thất bại.')
    }

    event.target.value = ''
  }

  const removeGalleryImage = (index: number) => {
    setForm((current) => ({
      ...current,
      gallery: splitLineSeparatedValues(current.gallery)
        .filter((_, imageIndex) => imageIndex !== index)
        .join('\n'),
    }))
  }

  const syncSelectedColors = (colors: Product['colors']) => {
    setForm((current) => ({ ...current, colors: stringifyColorLines(colors) }))
  }

  const addColorSelection = (color: Product['colors'][number]) => {
    const normalizedHex = color.hex.trim().toLowerCase()
    const normalizedName = color.name.trim()
    if (!normalizedName || !normalizedHex) {
      pushToast('error', 'Màu sắc cần có tên và mã màu hợp lệ.')
      return
    }

    const nextColors = selectedColors.some(
      (item) =>
        item.hex.toLowerCase() === normalizedHex || item.name.toLowerCase() === normalizedName.toLowerCase(),
    )
      ? selectedColors
      : [...selectedColors, { name: normalizedName, hex: normalizedHex }]

    syncSelectedColors(nextColors)
  }

  const removeSelectedColor = (hex: string) => {
    syncSelectedColors(selectedColors.filter((color) => color.hex.toLowerCase() !== hex.toLowerCase()))
  }

  const handleAddCustomColor = () => {
    addColorSelection({
      name: colorDraftName.trim() || `Color ${selectedColors.length + 1}`,
      hex: colorDraftHex,
    })
    setColorDraftName('')
  }

  const handleSave = async () => {
    if (isSaving) {
      return
    }

    if (!form.name.trim() || !form.originalPrice || !form.category) {
      pushToast('error', 'Vui lòng nhập tên sản phẩm, giá gốc và danh mục.')
      return
    }

    const basePrice = Number(form.originalPrice)
    const normalizedDiscountPercent = normalizeDiscountPercent(form.discountPercent)
    const discountPercent = Number(normalizedDiscountPercent)
    const cost = getComputedSalePrice(form.originalPrice, normalizedDiscountPercent)

    if (!Number.isFinite(basePrice) || basePrice < 0 || cost === null) {
      pushToast('error', 'Giá gốc hoặc phần trăm giảm giá không hợp lệ.')
      return
    }

    if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent >= 100) {
      pushToast('error', 'Phần trăm giảm giá phải nằm trong khoảng từ 0 đến 99.')
      return
    }

    setIsSaving(true)

    const isAdding = panel === 'add'
    const originalPrice = basePrice
    const image = isAdding ? form.image.trim() : form.image.trim() || createProductImage(form.category)
    const mockData = createProductMockData({
      name: form.name.trim(),
      image,
      country: form.country,
      category: form.category,
      rating: Number(form.rating || '0'),
    })
    const gallery = splitLineSeparatedValues(form.gallery)
    const sizes = splitCommaSeparatedLines(form.sizes)
    const baseProduct = {
      id: panel === 'add' ? createAdminProductId() : panel!.id,
      name: form.name.trim(),
      image,
      images: gallery.length > 0 ? gallery : mockData.images,
      cost,
      originalPrice,
      description:
        panel === 'add'
          ? `Sản phẩm ${form.name.trim()} được thêm từ trang quản trị.`
          : panel!.description,
      country: form.country,
      category: form.category,
      rating: Number(form.rating || '0'),
      status: form.status,
      inStock: form.inStock,
    }

    const nextProduct: Product = {
      ...baseProduct,
      ...createProductMockData({
        name: baseProduct.name,
        image: baseProduct.image,
        country: baseProduct.country,
        category: baseProduct.category,
        rating: baseProduct.rating,
      }),
    }

    nextProduct.description =
      form.description.trim() ||
      (panel === 'add'
        ? `Sản phẩm ${form.name.trim()} được thêm từ trang quản trị.`
        : nextProduct.description)

    if (gallery.length > 0) {
      nextProduct.images = gallery
    }
    if (isAdding) {
      nextProduct.description = form.description.trim()
    }

    nextProduct.colors = parseColorLines(form.colors, nextProduct.colors)
    nextProduct.sizes = sizes.length > 0 ? sizes : nextProduct.sizes
    if (isAdding) {
      nextProduct.colors = parseColorLines(form.colors, [])
      nextProduct.sizes = sizes
    }
    nextProduct.tags = nextProduct.tags.map((tag) =>
      tag.toLowerCase().includes('đánh giá') || tag.toLowerCase().includes('danh gia')
        ? 'Đánh giá 0/5'
        : tag,
    )
    nextProduct.sizeGuide = form.sizeGuide.trim() || nextProduct.sizeGuide
    if (isAdding) {
      nextProduct.sizeGuide = form.sizeGuide.trim()
    }

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 350))

      if (panel === 'add') {
        addProduct(nextProduct)
        pushToast('success', 'Đã tạo sản phẩm mới.')
      } else if (panel) {
        updateProduct(nextProduct)
        pushToast('success', 'Đã cập nhật sản phẩm.')
      }

      setPanel(null)
    } catch {
      pushToast('error', 'Không thể lưu sản phẩm. Vui lòng thử lại.')
    } finally {
      setIsSaving(false)
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
            <>
              <span className="text-sm text-[#7a7570]">
                {filteredProducts.length}/{products.length}
              </span>
              <button
                type="button"
                onClick={openAdd}
                className="inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-r from-[#ea580c] to-[#f7931a] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_18px_-8px_rgba(247,147,26,0.7)]"
              >
                <Plus size={15} strokeWidth={2.2} />
                Thêm sản phẩm
              </button>
            </>
          }
        >
          <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-[10px] border border-[#3a3530] bg-[#111] px-3 py-2.5 md:max-w-[290px]">
            <Search size={15} className="text-[#7a7570]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm sản phẩm..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#5f5a55]"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(event) => setFilterCategory(event.target.value)}
            className="rounded-[10px] border border-[#3a3530] bg-[#111] px-3 py-2.5 text-sm text-white outline-none"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="rounded-[10px] border border-[#3a3530] bg-[#111] px-3 py-2.5 text-sm text-white outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </AdminToolbar>

        <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
          <AdminPanel className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left">
                <thead>
                  <tr className="bg-black/10 text-[11px] uppercase tracking-[0.22em] text-[#7a7570]">
                    <th className="px-6 py-4 font-medium">Sản phẩm</th>
                    <th className="px-6 py-4 font-medium">Danh mục</th>
                    <th className="px-6 py-4 font-medium">Giá</th>
                    <th className="px-6 py-4 font-medium">Giá gốc</th>
                    <th className="px-6 py-4 font-medium">Rating</th>
                    <th className="px-6 py-4 font-medium">Xuất xứ</th>
                    <th className="px-6 py-4 font-medium">Trạng thái</th>
                    <th className="px-6 py-4 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const category = categories.find((item) => item.name === product.category)
                    const originalPrice = product.originalPrice ?? product.cost
                    const discount =
                      originalPrice > 0
                        ? Math.max(0, Math.round((1 - product.cost / originalPrice) * 100))
                        : 0

                    return (
                      <tr
                        key={product.id}
                        className="border-t border-[#2e2a24] transition hover:bg-white/[0.025]"
                      >
                        <td className="max-w-[320px] px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[#3a3530] bg-[#111]">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-[1.02rem] font-semibold text-white">
                                {product.name}
                              </div>
                              <div className="mt-1 font-mono text-[11px] text-[#7a7570]">
                                {product.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-[#9b958e]">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: category?.color ?? '#7a7570' }}
                            />
                            {product.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-[#f7931a]">
                          {formatAdminCurrency(product.cost)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="text-[#9b958e]">
                            <span className={discount > 0 ? 'line-through' : ''}>
                              {formatAdminCurrency(originalPrice)}
                            </span>
                            <span className="ml-2 rounded bg-[#ea580c] px-1.5 py-0.5 text-[10px] font-bold text-white">
                              -{discount}%
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#c8a84b]">★ {product.rating}</td>
                        <td className="px-6 py-4 text-sm text-[#9b958e]">{product.country}</td>
                        <td className="px-6 py-4">
                          <AdminBadge status={product.status ?? 'active'} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(product)}
                              className="inline-flex items-center gap-1 rounded-[8px] border border-[#3a3530] px-3 py-1.5 text-xs text-[#9b958e] transition hover:text-white"
                            >
                              <Pencil size={13} />
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProduct(product.id)}
                              className="inline-flex items-center gap-1 rounded-[8px] border border-red-500/25 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/8"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="px-6 py-16 text-center text-sm text-[#7a7570]">
                Không tìm thấy sản phẩm nào.
              </div>
            ) : null}
          </AdminPanel>
        </div>
      </div>

      {panel ? (
        <AdminDrawer
          title={panel === 'add' ? 'Thêm sản phẩm' : 'Sửa sản phẩm'}
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
          <AdminField label="Hình ảnh">
            <div className="space-y-3">
              <div className="overflow-hidden rounded-[18px] border border-[#3a3530] bg-[#111]">
                {previewImage ? (
                  <div className="aspect-[4/3] w-full bg-[#111]">
                    <img
                      src={previewImage}
                      alt="Preview sản phẩm"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#16110c_0%,#111111_100%)]">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(247,147,26,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(247,147,26,0.05)_1px,transparent_1px)] bg-[size:28px_28px]" />
                    <div className="relative z-10 flex max-w-[220px] flex-col items-center px-6 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-[#7a5623] bg-[#1d140c] text-[#f7931a] shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
                        <ImagePlus size={28} strokeWidth={1.8} />
                      </div>
                      <div className="mt-4 text-sm font-semibold text-white">Chưa có ảnh sản phẩm</div>
                      <div className="mt-1 text-xs leading-5 text-[#8b847c]">
                        Tải ảnh để xem preview trực tiếp trong danh sách quản trị.
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#7a5623] bg-[#1b140d] px-4 py-3 text-sm font-medium text-[#f0ece6] transition hover:border-[#f7931a]">
                <Upload size={15} />
                Tải ảnh sản phẩm
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              {form.image ? (
                <button
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, image: '' }))}
                  className="w-full rounded-[10px] border border-[#3a3530] px-4 py-2.5 text-sm text-[#9b958e] transition hover:text-white"
                >
                  Bỏ ảnh đã chọn
                </button>
              ) : null}
            </div>
          </AdminField>

          <AdminField label="Tên sản phẩm">
            <AdminInput
              value={form.name}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Tên sản phẩm..."
            />
          </AdminField>

          <AdminField label="Màu sắc">
            <div className="space-y-4">
              <div className="rounded-[16px] border border-[#3a3530] bg-[#14110f] p-3">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a7570]">
                  Bảng chọn nhanh
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {colorPresets.map((color) => {
                    const isActive = selectedColors.some(
                      (item) => item.hex.toLowerCase() === color.hex.toLowerCase(),
                    )

                    return (
                      <button
                        key={`${color.name}-${color.hex}`}
                        type="button"
                        onClick={() => addColorSelection(color)}
                        className={cn(
                          'group flex flex-col items-center gap-2 rounded-[14px] border px-2 py-3 transition',
                          isActive
                            ? 'border-[#f4b321] bg-[#20170d]'
                            : 'border-[#2d2822] bg-[#181411] hover:border-[#6f5430]',
                        )}
                      >
                        <span
                          className="h-8 w-8 rounded-full border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14)]"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-center text-[11px] leading-4 text-[#d5cec3]">
                          {color.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-[16px] border border-[#3a3530] bg-[#14110f] p-3">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a7570]">
                  Màu tùy chỉnh
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colorDraftHex}
                    onChange={(event) => setColorDraftHex(event.target.value)}
                    className="h-11 w-14 cursor-pointer rounded-[12px] border border-[#3a3530] bg-transparent p-1"
                    aria-label="Chọn mã màu"
                  />
                  <AdminInput
                    value={colorDraftName}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setColorDraftName(event.target.value)
                    }
                    placeholder="Tên màu hiển thị"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomColor}
                    className="rounded-[12px] border border-[#7a5623] bg-[#1d140c] px-4 py-2.5 text-sm font-semibold text-[#f0ece6] transition hover:border-[#f7931a] hover:text-white"
                  >
                    Thêm
                  </button>
                </div>
              </div>

              <div className="rounded-[16px] border border-[#3a3530] bg-[#14110f] p-3">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a7570]">
                  Đã chọn
                </div>
                {selectedColors.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedColors.map((color) => (
                      <div
                        key={`${color.name}-${color.hex}`}
                        className="inline-flex items-center gap-2 rounded-full border border-[#3a3530] bg-[#111] px-3 py-2 text-sm text-[#f0ece6]"
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-white/10"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.name}</span>
                        <button
                          type="button"
                          onClick={() => removeSelectedColor(color.hex)}
                          className="text-[#7a7570] transition hover:text-white"
                          aria-label={`Xóa màu ${color.name}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[12px] border border-dashed border-[#2d2822] px-3 py-3 text-sm text-[#7a7570]">
                    Chọn màu từ bảng phía trên để hiện ở đây.
                  </div>
                )}
              </div>

              <AdminInput
                as="textarea"
                value={form.colors}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  setForm((current) => ({ ...current, colors: event.target.value }))
                }
                placeholder={"Mỗi dòng: Tên màu|#HEX\nKem vani|#dcc7a1"}
                className="hidden"
              />
            </div>
          </AdminField>

          <AdminField label="Mô tả ngắn">
            <AdminInput
              as="textarea"
              value={form.description}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Mô tả chất liệu, form dáng, cảm giác mặc..."
              className="min-h-[96px]"
            />
          </AdminField>

          <AdminField label="Danh mục">
            <AdminInput
              as="select"
              value={form.category}
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                setForm((current) => ({ ...current, category: event.target.value }))
              }
            >
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </AdminInput>
          </AdminField>

          <div className="grid grid-cols-2 gap-3">
            <AdminField label="Giá gốc (₫)">
              <AdminInput
                type="number"
                min="0"
                value={form.originalPrice}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setForm((current) => ({ ...current, originalPrice: event.target.value }))
                }
                placeholder="750000"
              />
            </AdminField>

            <AdminField label="% giảm giá">
              <AdminInput
                type="number"
                min="0"
                max="99"
                value={form.discountPercent}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setForm((current) => ({ ...current, discountPercent: event.target.value }))
                }
                onBlur={() =>
                  setForm((current) => ({
                    ...current,
                    discountPercent: normalizeDiscountPercent(current.discountPercent),
                  }))
                }
                placeholder="0"
              />
            </AdminField>
          </div>

          <AdminField label="Giá bán tự tính (₫)">
            <AdminInput
              value={previewCost !== null ? String(previewCost) : ''}
              readOnly
              className="text-[#7a7570]"
              placeholder="Tự động tính từ giá gốc"
            />
          </AdminField>

          <div className="grid grid-cols-2 gap-3">
            <AdminField label="Xuất xứ">
              <AdminInput
                as="select"
                value={form.country}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  setForm((current) => ({ ...current, country: event.target.value }))
                }
              >
                {countryOptions
                  .filter((option) => option.value !== 'All')
                  .map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.value}
                    </option>
                  ))}
              </AdminInput>
            </AdminField>

            <AdminField label="Trạng thái">
              <AdminInput
                as="select"
                value={form.status}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as 'active' | 'inactive',
                  }))
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </AdminInput>
            </AdminField>
          </div>

          <AdminField label="Gallery ảnh">
            <div className="space-y-3">
              {galleryImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {galleryImages.map((image, index) => (
                    <div
                      key={`${index}-${image.slice(0, 32)}`}
                      className="group relative overflow-hidden rounded-[14px] border border-[#3a3530] bg-[#111]"
                    >
                      <div className="aspect-square w-full">
                        <img
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                        aria-label={`Xóa ảnh gallery ${index + 1}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#7a5623] bg-[#1b140d] px-4 py-3 text-sm font-medium text-[#f0ece6] transition hover:border-[#f7931a]">
                <Upload size={15} />
                Thêm ảnh gallery
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleGalleryUpload}
                />
              </label>
            </div>
          </AdminField>

          <div className="grid grid-cols-2 gap-3">
            <AdminField label="Sizes">
              <AdminInput
                as="textarea"
                value={form.sizes}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  setForm((current) => ({ ...current, sizes: event.target.value }))
                }
                placeholder="S, M, L, XL"
                className="min-h-[88px]"
              />
            </AdminField>
          </div>


          <AdminField label="Hướng dẫn chọn size">
            <AdminInput
              as="textarea"
              value={form.sizeGuide}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                setForm((current) => ({ ...current, sizeGuide: event.target.value }))
              }
              placeholder="Gợi ý chọn size cho khách."
              className="min-h-[88px]"
            />
          </AdminField>

          <AdminField label="Tồn kho">
            <div className="flex gap-6 pt-1">
              {[true, false].map((value) => (
                <label
                  key={String(value)}
                  className="flex cursor-pointer items-center gap-2 text-sm text-[#9b958e]"
                >
                  <button
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, inStock: value }))}
                    className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                      form.inStock === value
                        ? 'border-[#f7931a] bg-[#f7931a]'
                        : 'border-[#3a3530] bg-transparent'
                    }`}
                    aria-label={value ? 'Còn hàng' : 'Hết hàng'}
                  >
                    {form.inStock === value ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    ) : null}
                  </button>
                  {value ? 'Còn hàng' : 'Hết hàng'}
                </label>
              ))}
            </div>
          </AdminField>
        </AdminDrawer>
      ) : null}
    </div>
  )
}

export default ProductPage

