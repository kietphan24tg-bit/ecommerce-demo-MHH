import { ImagePlus, Pencil, Plus, Search, Trash2, Upload } from 'lucide-react'
import { useMemo, useState, type ChangeEvent } from 'react'
import { createProductImage, createProductMockData } from '../../data/market'
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
  category: string
  originalPrice: string
  discountPercent: string
  country: string
  rating: string
  status: 'active' | 'inactive'
  inStock: boolean
}

function getDiscountPercent(product: Pick<Product, 'cost' | 'originalPrice'>) {
  if (!product.originalPrice || product.originalPrice <= 0) {
    return '0'
  }

  return String(Math.round((1 - product.cost / product.originalPrice) * 100))
}

function getComputedSalePrice(originalPrice: string, discountPercent: string) {
  const basePrice = Number(originalPrice)
  const discount = Number(discountPercent || '0')

  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    return null
  }

  if (!Number.isFinite(discount) || discount < 0 || discount >= 100) {
    return null
  }

  return Math.round(basePrice * (1 - discount / 100))
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
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
  const [form, setForm] = useState<ProductFormState>({
    name: '',
    image: '',
    category: '',
    originalPrice: '',
    discountPercent: '0',
    country: 'Vietnam',
    rating: '4.0',
    status: 'active',
    inStock: true,
  })

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

  const previewCost = getComputedSalePrice(form.originalPrice, form.discountPercent)
  const previewImage = form.image.trim()

  const openAdd = () => {
    setForm({
      name: '',
      image: '',
      category: categories[0]?.name ?? '',
      originalPrice: '',
      discountPercent: '0',
      country: 'Vietnam',
      rating: '4.0',
      status: 'active',
      inStock: true,
    })
    setPanel('add')
  }

  const openEdit = (product: Product) => {
    setForm({
      name: product.name,
      image: product.image,
      category: product.category,
      originalPrice: String(product.originalPrice ?? product.cost),
      discountPercent: getDiscountPercent(product),
      country: product.country,
      rating: String(product.rating),
      status: product.status ?? 'active',
      inStock: product.inStock !== false,
    })
    setPanel(product)
  }

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const image = await readFileAsDataUrl(file)
    if (!image) {
      return
    }

    setForm((current) => ({ ...current, image }))
    event.target.value = ''
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.originalPrice || !form.category) {
      return
    }

    const basePrice = Number(form.originalPrice)
    const discountPercent = Number(form.discountPercent || '0')
    const cost = getComputedSalePrice(form.originalPrice, form.discountPercent)

    if (!Number.isFinite(basePrice) || basePrice <= 0 || cost === null) {
      return
    }

    if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent >= 100) {
      return
    }

    const originalPrice = basePrice
    const image = form.image.trim() || createProductImage(form.category)

    const baseProduct = {
      id: panel === 'add' ? createAdminProductId() : panel!.id,
      name: form.name.trim(),
      image,
      cost,
      originalPrice,
      description:
        panel === 'add'
          ? `Sản phẩm ${form.name.trim()} được thêm từ trang quản trị.`
          : panel!.description,
      country: form.country,
      category: form.category,
      rating: Number(form.rating),
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

    if (panel === 'add') {
      addProduct(nextProduct)
    } else if (panel) {
      updateProduct(nextProduct)
    }

    setPanel(null)
  }

  return (
    <div className="flex h-full overflow-hidden">
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
                    const discount = Math.round((1 - product.cost / originalPrice) * 100)

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
          onClose={() => setPanel(null)}
          onSave={handleSave}
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
