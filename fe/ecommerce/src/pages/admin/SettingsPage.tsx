import { AdminPanel } from '../../components/admin/AdminUi'

function SettingsPage() {
  return (
    <div className="h-full overflow-y-auto px-8 py-7">
      <AdminPanel className="flex min-h-[280px] items-center justify-center p-8">
        <div className="text-center">
          <div className="font-display text-[2.2rem] font-bold text-white">Cài đặt</div>
          <p className="mt-3 text-[1.02rem] text-[#7a7570]">Trang cài đặt đang phát triển…</p>
        </div>
      </AdminPanel>
    </div>
  )
}

export default SettingsPage
