import { useState } from 'react'
import { DeleteProductDialog } from '../../components/admin/DeleteProductDialog'
import { ProductForm } from '../../components/admin/ProductForm'
import { ProductTable } from '../../components/admin/ProductTable'
import { SectionEyebrow } from '../../components/shared/SectionEyebrow'
import {
  createProductImage,
  createProductMockData,
  DEFAULT_PRODUCT_FORM,
} from '../../data/market'
import { useMarketStore } from '../../store/useMarketStore'
import type { Product, ProductFormValues } from '../../types/product'

function ProductPage() {
  const products = useMarketStore((state) => state.products)
  const addProduct = useMarketStore((state) => state.addProduct)
  const updateProduct = useMarketStore((state) => state.updateProduct)
  const deleteProduct = useMarketStore((state) => state.deleteProduct)
  const [formValues, setFormValues] = useState(DEFAULT_PRODUCT_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const setField = <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) => {
    setFormValues((current) => ({ ...current, [key]: value }))
  }

  const resetForm = () => {
    setFormValues(DEFAULT_PRODUCT_FORM)
    setEditingId(null)
  }

  const handleSubmit = () => {
    if (!formValues.name || !formValues.cost || !formValues.rating) {
      return
    }

    const product: Product = {
      id: editingId ?? `prd-${Date.now().toString().slice(-6)}`,
      name: formValues.name,
      image: formValues.image.trim() || createProductImage(formValues.category),
      cost: Number(formValues.cost),
      description: formValues.description,
      country: formValues.country,
      category: formValues.category,
      rating: Number(formValues.rating),
      ...createProductMockData({
        name: formValues.name,
        image: formValues.image.trim() || createProductImage(formValues.category),
        country: formValues.country,
        category: formValues.category,
        rating: Number(formValues.rating),
      }),
    }

    if (editingId) {
      updateProduct(product)
    } else {
      addProduct(product)
    }

    resetForm()
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setFormValues({
      name: product.name,
      image: product.image,
      cost: String(product.cost),
      description: product.description,
      country: product.country,
      category: product.category,
      rating: String(product.rating),
    })
  }

  return (
    <div className="space-y-8">
      <section className="surface p-7">
        <SectionEyebrow>Catalog Manager</SectionEyebrow>
        <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
          Quản lý toàn bộ catalog thời trang dùng chung cho storefront và admin.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-400">
          Mọi thay đổi tại đây sẽ cập nhật trực tiếp danh sách sản phẩm, bộ lọc
          và các số liệu tổng quan trong toàn ứng dụng.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <ProductForm
          values={formValues}
          editingId={editingId}
          onChange={setField}
          onSubmit={handleSubmit}
          onCancelEdit={resetForm}
        />

        <ProductTable
          products={products}
          editingId={editingId}
          onEdit={handleEdit}
          onDelete={setDeleteId}
        />
      </section>

      <DeleteProductDialog
        productId={deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteProduct(deleteId)
          }

          if (deleteId === editingId) {
            resetForm()
          }

          setDeleteId(null)
        }}
      />
    </div>
  )
}

export default ProductPage
