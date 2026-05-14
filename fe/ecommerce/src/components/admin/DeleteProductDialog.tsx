import { AlertTriangle } from 'lucide-react'
import { Button } from '../ui/button'

type DeleteProductDialogProps = {
  productId: string | null
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteProductDialog({
  productId,
  onCancel,
  onConfirm,
}: DeleteProductDialogProps) {
  if (!productId) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
      <div className="surface w-full max-w-md p-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-red-500/25 bg-red-500/10 text-red-300">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="font-display text-2xl font-semibold text-white">
          Xác nhận xóa sản phẩm
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          Sản phẩm <span className="font-mono text-red-300">{productId}</span> sẽ bị
          xóa khỏi catalog dùng chung.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onCancel}>
            Hủy
          </Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm}>
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  )
}
