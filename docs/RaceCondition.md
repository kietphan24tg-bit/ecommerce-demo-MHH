Phân tích kỹ thuật: Mạng internet không bao giờ ổn định. Một yêu cầu (request) gửi đi sau có thể hoàn thành trước một yêu cầu gửi đi trước đó. 

Ví dụ kinh điển: Lấy bối cảnh một thanh tìm kiếm sản phẩm. Người dùng gõ "Áo", ứng dụng gửi API Request số 1 (mất 2 giây để tải vì dữ liệu lớn). Ngay sau đó người dùng gõ thêm thành "Áo khoác", ứng dụng gửi API Request số 2 (chỉ mất 0.5 giây). 

Thực tế diễn ra: Request 2 trả về kết quả "Áo khoác" và hiển thị lên màn hình. Nhưng 1.5 giây sau, Request 1 mới trả về kết quả "Áo", và ghi đè lên kết quả của Request 2. Mặc dù thanh tìm kiếm đang ghi chữ "Áo khoác", danh sách lại hiển thị tất cả các loại "Áo". 

Giải pháp: Để khắc phục, các kiến trúc sư thường áp dụng cơ chế Hủy yêu cầu (Cancellation Tokens hoặc AbortController trong JavaScript) để tự động triệt tiêu các luồng dữ liệu cũ ngay khi một luồng mới được kích hoạt. 

=> Giải quyết lỗi: 

4. Cách thực tế nhất: debounce + abort + requestId

Trong app thật, mình khuyên dùng combo này:

1. Debounce input
2. Abort request cũ
3. Kiểm tra requestId trước khi set state

Flow chuẩn:

User gõ keyword
↓
Đợi 300-500ms
↓
Hủy request cũ nếu có
↓
Gửi request mới
↓
Response trả về
↓
Kiểm tra có phải request mới nhất không
↓
Nếu đúng → update UI
Nếu cũ → bỏ qua

5. Nếu dùng TanStack Query thì sao?

Nếu dùng TanStack Query, thực tế dễ hơn nhiều.

Ví dụ:

const { data, isLoading } = useQuery({
  queryKey: ['products', debouncedKeyword],
  queryFn: async ({ signal }) => {
    const response = await fetch(
      `/api/products?keyword=${encodeURIComponent(debouncedKeyword)}`,
      { signal }
    );

    if (!response.ok) {
      throw new Error('Failed to search products');
    }

    return response.json();
  },
  enabled: debouncedKeyword.trim().length > 0,
});

TanStack Query giúp:

- Mỗi keyword có queryKey riêng
- Query cũ không ghi đè bừa vào query mới
- Có thể truyền signal để hủy request
- Quản lý loading/error/cache tốt hơn

Trong project React thực tế, nếu đã dùng TanStack Query, nên dùng nó cho search/list/filter data.
