#Luồng trạng thái: state machine:
Trạng thái khởi tạo
trạng thái trung gian : validate dữ liệu khi chưa submit
Trạng thái thành công
Trạng thái lỗi : nút thử lại
Trạng thái trống : nút điều hướng sang trang

Sơ đồ luồng dữ liệu (Data Flow Diagrams - DFD). Trong bối cảnh frontend hiện đại, DFD không chỉ đơn thuần là việc vẽ các mũi tên nối các khối hộp; nó là bản thiết kế (blueprint) kiến trúc vạch rõ vòng đời của một luồng thông tin, từ khoảnh khắc người dùng chạm vào màn hình cho đến khi dữ liệu được khắc ghi vào cơ sở dữ liệu và phản hồi ngược lại. Việc mô hình hóa thành công luồng dữ liệu này chia làm bốn giai đoạn nguyên thủy sau đây.

-State lưu và hiển thị giao diện, khi cập nhật thì cập nhật state trước, xong sau đó cập nhật data gọi api 
 
 function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Counter App</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increase
      </button>
    </div>
  );
} 

=> vidu này gọi là dùng virtual DOM 
1. State count thay đổi
2. Component render lại
3. Tạo Virtual DOM mới
4. So sánh với Virtual DOM cũ
5. Thấy chỉ text trong <p> thay đổi
6. Update Real DOM đúng chỗ đó
