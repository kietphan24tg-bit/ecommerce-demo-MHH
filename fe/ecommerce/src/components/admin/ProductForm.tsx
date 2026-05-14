import {
  ADMIN_CATEGORIES,
  ADMIN_COUNTRIES,
  CATEGORY_LABELS,
  COUNTRY_LABELS,
} from '../../data/market'
import type { ProductFormValues } from '../../types/product'
import { SectionEyebrow } from '../shared/SectionEyebrow'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import { Textarea } from '../ui/textarea'

type ProductFormProps = {
  values: ProductFormValues
  editingId: string | null
  onChange: <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) => void
  onSubmit: () => void
  onCancelEdit: () => void
}

export function ProductForm({
  values,
  editingId,
  onChange,
  onSubmit,
  onCancelEdit,
}: ProductFormProps) {
  return (
    <section className="surface sticky top-24 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-white/6 bg-orange-500/6 px-6 py-5">
        <span
          className={`h-3 w-3 rounded-full ${
            editingId
              ? 'bg-yellow-300 shadow-[0_0_16px_rgba(253,224,71,0.85)]'
              : 'bg-orange-400 shadow-[0_0_16px_rgba(251,146,60,0.85)]'
          }`}
        />
        <div>
          <h2 className="font-display text-xl font-semibold text-white">
            {editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <p className="meta-label mt-1">{editingId ?? 'draft-new-product'}</p>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div>
          <SectionEyebrow>Tên sản phẩm</SectionEyebrow>
          <Input
            value={values.name}
            placeholder="Ví dụ: Áo thun unisex Essential Cotton"
            onChange={(event) => onChange('name', event.target.value)}
          />
        </div>

        <div>
          <SectionEyebrow>Ảnh sản phẩm</SectionEyebrow>
          <Input
            value={values.image}
            placeholder="https://... hoặc để trống để dùng ảnh minh họa fallback"
            onChange={(event) => onChange('image', event.target.value)}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <SectionEyebrow>Giá bán</SectionEyebrow>
            <Input
              type="number"
              min={0}
              value={values.cost}
              placeholder="0"
              onChange={(event) => onChange('cost', event.target.value)}
            />
          </div>
          <div>
            <SectionEyebrow>Đánh giá</SectionEyebrow>
            <Input
              type="number"
              min={1}
              max={5}
              value={values.rating}
              placeholder="1 - 5"
              onChange={(event) => onChange('rating', event.target.value)}
            />
          </div>
        </div>

        <div>
          <SectionEyebrow>Mô tả</SectionEyebrow>
          <Textarea
            value={values.description}
            placeholder="Mô tả chất liệu, form dáng, dịp sử dụng..."
            onChange={(event) => onChange('description', event.target.value)}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <SectionEyebrow>Xuất xứ</SectionEyebrow>
            <Select
              value={values.country}
              onChange={(event) => onChange('country', event.target.value)}
            >
              {ADMIN_COUNTRIES.map((country) => (
                <option key={country} value={country} className="bg-slate-950">
                  {COUNTRY_LABELS[country] ?? country}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <SectionEyebrow>Danh mục</SectionEyebrow>
            <Select
              value={values.category}
              onChange={(event) => onChange('category', event.target.value)}
            >
              {ADMIN_CATEGORIES.map((category) => (
                <option key={category} value={category} className="bg-slate-950">
                  {CATEGORY_LABELS[category] ?? category}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <Button className="w-full" onClick={onSubmit}>
            {editingId ? 'Lưu cập nhật' : '+ Thêm vào catalog'}
          </Button>
          {editingId ? (
            <Button variant="secondary" className="w-full" onClick={onCancelEdit}>
              Hủy chỉnh sửa
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
