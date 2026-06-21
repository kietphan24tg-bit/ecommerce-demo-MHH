- Cùng một trang nhưng gọi api nhiều chỗ inconsistency 
- Gom các api gọi một lần và trả về thay vì gọi từng cái và hiện từng cái 
React Suspense cho phép hiển thị fallback trong lúc children chưa sẵn sàng; khi dữ liệu/code sẵn sàng thì React chuyển từ fallback sang UI thật.

Sai nếu bạn bọc từng phần riêng:

<Suspense fallback={<TotalSkeleton />}>
  <TotalRevenue />
</Suspense>

<Suspense fallback={<ChartSkeleton />}>
  <RevenueChart />
</Suspense>

Vì lúc đó:

TotalRevenue có thể hiện trước
RevenueChart hiện sau

Nếu 2 phần này phải nhất quán, nên bọc chung:

<Suspense fallback={<DashboardSkeleton />}>
  <DashboardContent />
</Suspense>

Tư duy:

Dữ liệu phụ thuộc nhau → dùng một Suspense boundary chung
Dữ liệu độc lập nhau → có thể dùng Suspense boundary riêng

9. Với TanStack Query nên làm thế nào?

TanStack Query quản lý server state bằng queryKey; query key được dùng cho caching, refetching, và sharing dữ liệu giữa các component.

Trường hợp tốt nhất

Một query cho cả dashboard:

const dashboardQuery = useQuery({
  queryKey: ['dashboard', from, to],
  queryFn: ({ signal }) => fetchDashboard({ from, to, signal }),
});

Rồi truyền data xuống:

<DashboardHeader total={dashboardQuery.data.totalRevenue} />
<DashboardChart data={dashboardQuery.data.chart} />
<DashboardTable data={dashboardQuery.data.rows} />

Đây là sạch nhất.
