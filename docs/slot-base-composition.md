# Slot-based Composition

Tạo component như một **khung** có sẵn layout / style / behavior, rồi cho phép developer truyền UI khác vào bên trong thông qua `children` hoặc các slot có tên như `header`, `body`, `footer`.

## Khi nào nên dùng?

Dùng khi component có **UI bên trong thường xuyên thay đổi**, nhưng phần khung (layout, style, hành vi chung) vẫn giữ nguyên.

Ví dụ điển hình:

- Layout page (header / sidebar / footer cố định, nội dung page thay đổi)
- Modal, Card, Panel
- Form wrapper (label + error cố định, input tùy biến)
- Design System component dùng chung nhiều team

## So sánh: không dùng vs dùng composition

**Không dùng** — mỗi page tự lặp layout:

```tsx
function CartPage() {
  return (
    <div className="min-h-screen">
      <header>{/* copy-paste header */}</header>
      <main><CartContent /></main>
    </div>
  )
}
```

**Dùng composition** — layout một lần, page chỉ lo nội dung:

```tsx
function CartPage() {
  return <CartContent />
}
// Layout bọc bên ngoài và inject nội dung vào đúng slot
```

---

## 1. `children` — slot cơ bản nhất trong React

Ví dụ đơn giản:

```tsx
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      {children}
    </div>
  )
}
```

Dùng:

```tsx
<Card>
  <h2>Airline Booking</h2>
  <p>Search flights, book tickets, manage booking.</p>
  <button>View detail</button>
</Card>
```

Ở đây, `{children}` chính là **default slot**.

---

## 2. Named slots

Trong React, ngoài `children`, có thể làm slot theo tên qua props `React.ReactNode`.

Ví dụ:

```tsx
type ModalProps = {
  header: React.ReactNode
  body: React.ReactNode
  footer: React.ReactNode
}

function Modal({ header, body, footer }: ModalProps) {
  return (
    <div className="modal">
      <div className="modal-header">{header}</div>
      <div className="modal-body">{body}</div>
      <div className="modal-footer">{footer}</div>
    </div>
  )
}
```

Dùng:

```tsx
<Modal
  header={<h2>Confirm payment</h2>}
  body={<p>Do you want to pay this booking?</p>}
  footer={
    <>
      <Button>Cancel</Button>
      <Button>Pay now</Button>
    </>
  }
/>
```

Slot tùy chọn với default fallback:

```tsx
type PageShellProps = {
  header?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
}

function PageShell({ header, footer, children }: PageShellProps) {
  return (
    <div>
      <header>{header ?? <DefaultHeader />}</header>
      <main>{children}</main>
      <footer>{footer ?? <DefaultFooter />}</footer>
    </div>
  )
}
```

---

## 3. Router `<Outlet />` — slot theo route

Trong React Router, `<Outlet />` là slot động: layout giữ khung, router tự render page con tùy URL.

Ví dụ trong project Ecommerce — `MarketShell` giữ header/nav/theme, page render vào `<Outlet />`:

```tsx
export function MarketShell({ area }: { area: 'user' | 'admin' }) {
  return (
    <div className="min-h-screen">
      <header>{/* nav, cart, brand — cố định */}</header>
      <main>
        <Outlet />  {/* slot main: ProductPage, CartPage, ... */}
      </main>
    </div>
  )
}
```

Cấu hình router:

```tsx
{
  path: '/',
  element: <UserLayout />,   // bọc MarketShell
  children: [
    { index: true, element: <ProductPage /> },
    { path: 'cart', element: <CartPage /> },
    { path: 'saved', element: <SavedPage /> },
  ],
}
```

Luồng hoạt động:

```
AppRouter → UserLayout → MarketShell → <Outlet /> → ProductPage / CartPage / ...
```

---

## 4. Compound components — slot ngầm qua sub-component

Thay vì nhiều props, chia component thành "gia đình" có vai trò rõ ràng. Pattern phổ biến trong Radix UI / shadcn/ui.

```tsx
<Dialog>
  <Dialog.Trigger>Mở</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>Tiêu đề</Dialog.Header>
    <Dialog.Body>Nội dung</Dialog.Body>
    <Dialog.Footer>
      <Button>Hủy</Button>
      <Button>Xác nhận</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog>
```

Mỗi sub-component (`Dialog.Header`, `Dialog.Body`, …) đóng vai trò một **named slot**, nhưng API linh hoạt hơn props thuần.

**Composition > configuration:**

```tsx
// ❌ Config object khổng lồ, khó mở rộng
<Table columns={[...]} actions={[...]} filters={[...]} />

// ✅ Composition — dễ đọc, dễ custom
<Table>
  <Table.Header>...</Table.Header>
  <Table.Body>...</Table.Body>
</Table>
```

---

## 5. `asChild` / Radix `Slot` — gắn behavior lên element con

Radix cung cấp `<Slot>` để merge props/style lên child thay vì bọc thêm một DOM node.

```tsx
<Button asChild>
  <Link to="/cart">Giỏ hàng</Link>
</Button>
```

`Button` không render thêm `<button>` riêng mà gắn style + behavior lên `<Link>` — tránh wrapper thừa, giữ semantics HTML đúng.

---

## 6. Vue — `<slot>` native

Vue có slot built-in, tương tự named slots trong React:

```vue
<!-- BaseLayout.vue -->
<template>
  <header><slot name="header" /></header>
  <main><slot /></main>
  <footer><slot name="footer" /></footer>
</template>
```

```vue
<!-- Dùng -->
<BaseLayout>
  <template #header>Nav</template>
  <Dashboard />
  <template #footer>© 2026</template>
</BaseLayout>
```

| Framework | Default slot | Named slot |
|-----------|-------------|------------|
| React | `children` | props `header`, `footer`, … |
| Vue | `<slot />` | `<slot name="header" />` |
| React Router | `<Outlet />` | nested routes |

---

## 7. Liên hệ với Design System

Design System là bộ component chuẩn của công ty, ví dụ:

- Button
- Input
- Modal
- Card
- Table
- Dropdown
- Layout
- Navigation
- FormField

Nếu component được thiết kế bằng slot tốt, nhiều team có thể dùng lại cùng một component nhưng nhét nội dung khác nhau vào.

Ví dụ cùng một `Card`:

```tsx
<Card>
  <ProductInfo />
</Card>

<Card>
  <UserProfile />
</Card>

<Card>
  <BookingSummary />
</Card>
```

Cùng một khung `Card`, nhưng dùng cho nhiều domain khác nhau.

---

## 8. Nguyên tắc thiết kế

| Nguyên tắc | Giải thích |
|------------|------------|
| Shell giữ invariant, slot giữ variant | Khung (spacing, màu, nav) cố định; nội dung thay đổi |
| Default hợp lý | Slot trống vẫn có UI ổn (`footer ?? <DefaultFooter />`) |
| Composition > configuration | Ưu tiên sub-component thay vì props config phức tạp |
| Tách shell khỏi business page | `MarketShell` ≠ `CartPage` — mỗi thứ một trách nhiệm |
| Tránh prop drilling sâu | Nhiều slot lồng nhau → cân nhắc Context hoặc compound components |

---

## 9. Khi nào **không** cần slot

- Component nhỏ, chỉ dùng một lần (ví dụ `ProductCard`)
- Không có phần "khung" tái sử dụng
- Over-abstract: tạo `GenericPageShell` với 12 slot nhưng thực tế chỉ dùng 1

---

## Tóm tắt

**Slot-based composition** = đảo ngược kiểm soát UI: component cha định nghĩa **cấu trúc**, component con / page định nghĩa **nội dung**.

| Cách | Khi nào dùng |
|------|-------------|
| `children` | Một vùng nội dung, API đơn giản |
| Named props (`header`, `footer`) | 2–4 vùng cố định, dễ đọc |
| `<Outlet />` | Layout theo route (React Router) |
| Compound components | UI kit phức tạp (Dialog, Tabs, Table) |
| `asChild` / Radix Slot | Gắn behavior lên element con, tránh wrapper thừa |
