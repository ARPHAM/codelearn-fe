# CHƯƠNG 4. HIỆN THỰC HÓA GIAO DIỆN VÀ GIẢI QUYẾT THÁCH THỨC KỸ THUẬT

Chương này tập trung trình bày việc hệ thống CodeLearn đã biến đổi các luồng nghiệp vụ trên lý thuyết trở thành mô hình ứng dụng thực tế. Trọng tâm của phần này chính là cách hiện thực hoá giao diện thông minh và thuật lại quá trình Audit, tối ưu hoá chuyên sâu để giải quyết các bài toán "lỗi ngầm" (Bugs & Bottlenecks) phát sinh trong suốt vòng đời xây dựng ứng dụng.

### 4.1. Hiện thực Không gian học tập cốt lõi của Sinh viên (Student Workspace)

Môi trường lý tưởng cho thực hành mã nguồn trực tuyến không đơn thuần là một Text Area (vùng nhập văn bản) mà là một Sandbox thu nhỏ để tránh sinh viên thao tác nhầm lên cấu trúc thư mục lõi. Giao diện được hiện thực hóa dựa trên **Monaco Editor** (Lõi của Visual Studio Code) nhúng vào nền tảng Next.js.

<!-- [DÁN ẢNH GIAO DIỆN Ở ĐÂY - ẢNH CHỤP MÀN HÌNH WORKSPACE CHIA ĐÔI] -->

**Mô tả Kỹ thuật Truyền tải Payload ràng buộc vùng (Area Constraints):**
Để ngăn chặn việc xóa nhầm thư mục gốc hay cấu trúc hàm `main` trong dạng bài "Điền vào chỗ trống", phương thức GET dữ liệu ban đầu từ Backend sẽ không trả về `string` đơn thuần mà trả về một cấu trúc Node/Object phức hợp chỉ định rõ ràng file nào bị cấm thay đổi.

*Đoạn mã JSON thiết kế mẫu (Khởi tạo Object nhận từ API CodeLearn):*
```json
{
  "workspace_id": "ws_1204_codelearn_python",
  "status": "ready",
  "files": [
    {
      "filename": "main.py",
      "content": "def handler():\n    # TODO: Điền logic tìm kiếm Nhị phân vào đây\n    pass\n\nif __name__ == '__main__':\n    handler()",
      "constraints": {
        "read_only": false,
        "locked_lines": [1, 4, 5],
        "can_rename": false,
        "can_delete": false
      }
    },
    {
      "filename": "test_runner.py",
      "content": "import sys\n# Bí mật hệ thống kiểm thử tự động",
      "constraints": {
        "read_only": true,
        "locked_lines": "all",
        "can_rename": false,
        "can_delete": false
      }
    }
  ]
}
```
Thông qua cơ chế bóc tách Payload bảo vệ này, Frontend (Context Store) phân tích thuộc tính `locked_lines` và `can_delete`. Ngay sau đó, nó tự động cập nhật State để vô hiệu hóa Menu chuột phải "Delete File", đồng thời chèn trực tiếp các bộ lọc (decorations) chặn Event gõ phím của Monaco vào các dòng mã cấm thao tác. Điều này biến trình soạn thảo trở thành một pháo đài cô lập an toàn, đảm bảo tính vẹn toàn cho các kỳ thi. Kèm theo đó, kết quả chấm thi (AC/WA/TLE) được đồng bộ hóa tức thời qua WebSockets (Socket.io) tạo trải nghiệm phản hồi không độ trễ.

### 4.2. Khối Phân tích và Quản trị dành cho Giảng viên (Lecturer Dashboard)

Quản lý học liệu đòi hỏi hệ thống phải có khả năng truy xuất dữ liệu đa thành phần theo chu kỳ nhanh. Giao diện này cung cấp một cái nhìn toàn cảnh về tiến độ hoàn thành thuật toán của lớp học, được thiết kế tập trung vào mảng Chart (Biểu đồ thống kê).

<!-- [DÁN ẢNH GIAO DIỆN Ở ĐÂY - ẢNH CHỤP MÀN HÌNH DASHBOARD GIẢNG VIÊN VÀ QUẢN LÝ KHÓA HỌC] -->

**Chức năng lõi:**
1. **Theo dõi tiến độ biểu đồ điểm số:** Giảng viên theo dõi được biểu đồ phân bố điểm số của lớp, phân luồng sinh viên theo tỷ lệ Phần trăm Pass Rate nhanh chóng.
2. **Kiểm tra trạng thái Nút thắt:** Có thể phát hiện được ngay những sinh viên bị "kẹt" lâu ở vòng Test-case thứ cấp để hệ thống gợi ý can thiệp.
3. **Mô-đun Plagiarism (Quét đạo văn):** Giao diện kích hoạt thuật toán so sánh Tokenization ở nền (Background mode), tính toán và High-light mã nguồn giống nhau nhằm phát hiện và cảnh báo các hành vi sao chép không trong sáng ở các lớp học quy mô lớn.

### 4.3. Cổng Quản trị hệ thống và Quản trị Hồ sơ phức tạp (Admin Portal)

Điểm nâng cao so với các hệ thống phổ thông là tài khoản hệ thống của CodeLearn chứa cực nhiều trường thông tin siêu dữ liệu (Metadata) mang tính đặc thù cao, như: Khoá học, ID Đại học, Số điện thoại bổ sung. Cổng Admin Portal cung cấp giao diện Table tối ưu hiển thị Pagination hàng nghìn User.

<!-- [DÁN ẢNH GIAO DIỆN Ở ĐÂY - ẢNH CHỤP MÀN HÌNH ADMIN PORTAL QUẢN LÝ USER] -->

Để bảo vệ sự toàn vẹn khối dữ liệu nhạy cảm này, API Endpoint cập nhật thuộc tính User ở đây được thiết lập hoàn toàn theo chuẩn Method `PATCH` (Cập nhật riêng rẽ) thay vì cấu trúc mặc định `PUT`. Chỉ những Key nào được truyền đi mới thay đổi trong Model Database, không gây hiện tượng xóa bỏ cấu hình ẩn.

### 4.4. Giải quyết các thách thức kỹ thuật trọng tâm (Kiểm toán Hiệu năng & Bug Fixes)

Quá trình Master Architect của một ứng dụng Next.js Application quy mô lớn đặt ra rất nhiều bài toán lớn về Tối ưu hiệu năng (Performance Optimization) đã được giải quyết:

#### Vấn đề 1: Lệch pha Hydration và lỗi Render Theme chớp tắt màn hình
Hệ thống sử dụng cơ chế Light/Dark theme theo cài đặt gốc của hệ điều hành (System Preferences). Tuy nhiên, vì Next.js luôn thực hiện Pre-render UI tĩnh ở phía máy chủ Node, nơi nó không hề biết người dùng tại Client đang dùng giao diện Tối hay Sáng. Khi HTML được tải về giao diện duyệt web (Browser) và Javascript Take-over, trình duyệt lập tức phát hiện sự sai lệch HTML Tree (Hydration Mismatch), dẫn đến lỗi FOUC (Flash of unstyled content) khiến màn hình bị chớp tắt trắng xóa rất thiếu chuyên nghiệp.

*Cách giải quyết đắc lực - Rendering trì hoãn kiểm soát (Mounted State Deferral):*
```javascript
// Giải pháp kỹ thuật bọc Theme Context Provider để triệt tiêu lỗi Hydration
"use client";
import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeContextWrapper({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Luồng này chỉ chạy sau khi DOM đã được gắn kết hoàn toàn trên Client
    setMounted(true);
  }, []);

  if (!mounted) {
    // Trong lần Render Server đầu tiên, giữ lại khoảng trống ảo (opacity 0)
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  // Kết xuất đúng UI với bộ CSS phân luồng ngay sau khi Mounted
  return <ThemeProvider attribute="class" defaultTheme="system">{children}</ThemeProvider>;
}
```
Nhờ cơ chế cô lập Component ảo (Skeleton Wrapper) trong pha chờ này, dự án đã đạt tiêu chuẩn Lighthouse điểm số cao và vượt qua kiểm duyệt Linting ngặt nghèo của luồng Build Production trên Vercel.

#### Vấn đề 2: Khắc phục hiện tượng sập máy chủ vì Tràn vòng lặp (Impure Functions)
Trong quá trình xây dựng tính năng phân tích giao diện Dashboard, ứng dụng vấp phải lỗi `Maximum update depth exceeded` và lỗi Thiếu Module đệ quy, gây đứng hoàn toàn tiến trình `Next build` trên đường ống tự động CI/CD.

*Phân tích gốc lôgic (Root Cause):* Việc này xuất phát từ việc khởi tạo trực tiếp State hoặc gọi Trigger hàm API cập nhật bên trong thân Component thay vì bọc trong `useEffect` dependencies tĩnh, tạo ra các "Impure Functions" có Side-effects không kiểm soát. Hệ thống đã tiến hành Audit, cô lập giao tiếp nội bộ thông qua tín hiệu Context Provider. Gỡ bỏ triệt để các trạng thái phụ thuộc chéo vòng tròn. Xử lý triệt để bài toán này giúp quá trình Start Server ổn định, tiết kiệm đáng kể thời lượng Build RAM (từ 2.4 GB về lại 190 MB RAM ngưỡng vận hành an toàn).
