# PHẦN 4: HIỆN THỰC HÓA VÀ TRẢI NGHIỆM GIAO DIỆN

Phần báo cáo này tập trung làm rõ việc hệ thống CodeLearn đã biến đổi các luồng nghiệp vụ trên lý thuyết trở thành mô hình người dùng thực tế như thế nào. Trọng tâm của phần này chính là cách giải quyết các bài toán "lỗi ngầm" (Bug) diễn ra trong quá trình hiện thực hóa.

## 4.1. Không gian học tập của Sinh viên (Student Workspace)

Môi trường lý tưởng cho thực hành code không chỉ là một trình chỉnh sửa văn bản mà là một Sandbox thu nhỏ để tránh sinh viên thao tác nhầm lên cấu trúc lõi. 

<!-- [DÁN ẢNH GIAO DIỆN Ở ĐÂY] 
  (Bạn hãy chụp màn hình lúc giao diện sinh viên đang code có chia đôi màn hình Đề bài & Editor rồi dán vào đây) 
-->

**Xử lý kỹ thuật (Truyền tải Payload ràng buộc vùng):**
Để ngăn chặn can thiệp thư mục gốc trong dạng bài "Điền vào chỗ trống", phương thức GET dữ liệu ban đầu sẽ trả về một Object phức hợp chỉ định rõ ràng file nào bị cấm quyền thay đổi. 

*Đoạn mã JSON thiết kế mẫu (Khởi tạo Object nhận từ API):*
```json
{
  "workspace_id": "ws_1204_codelearn",
  "status": "ready",
  "files": [
    {
      "filename": "main.py",
      "content": "def handler():\n    # TODO: Điền code của bạn vào đây\n    pass\n\nif __name__ == '__main__':\n    handler()",
      "constraints": {
        "read_only": false,
        "locked_lines": [1, 4, 5],
        "can_rename": false,
        "can_delete": false
      }
    },
    {
      "filename": "test_runner.py",
      "content": "import sys...",
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
Nhờ cơ chế bóc tách Payload này, giao diện (Frontend) đọc được thẻ `locked_lines` và `can_delete`, từ đó tự động vô hiệu hóa thanh công cụ "File Explorer" cũng như chèn thuộc tính Read-only vào dòng mã quy định, biến trình soạn thảo thành cơ chế khóa an toàn tuyệt đối.

## 4.2. Bảng điều khiển phân tích của Giảng viên (Lecturer Dashboard)

Quản lý học liệu đòi hỏi khả năng truy xuất dữ liệu đa thành phần theo chu kỳ nhanh (Real-time). Giao diện này cung cấp một cái nhìn toàn diện về tiến độ hoàn thành thuật toán của lớp học. 

<!-- [DÁN ẢNH GIAO DIỆN Ở ĐÂY] 
  (Chụp màn hình trang quản lý khóa học / bài tập trắc nghiệm của giảng viên) 
-->

Được thiết kế dựa trên các biểu đồ trực quan, Dashboard cho phép Giảng viên phát hiện những sinh viên "vướng" lâu tại một Test-case cụ thể, từ đó hệ thống hỗ trợ can thiệp giảng dạy và định hướng lại tư duy cho lớp mà không cần đợi nộp bài về mail.

## 4.3. Cổng Quản trị hệ thống (Admin Portal)

Điểm nâng cao so với các hệ thống phổ thông là tài khoản sinh viên chứa cực nhiều trường thông tin đặc thù (Ngày sinh, Số điện thoại, Cơ quan/Trường Đại học mãng hóa, Môn học ghi danh). Hệ thống xây dựng một Admin Portal tĩnh, kiểm soát luồng thông tin đổ về theo phương pháp PATCH để đảm bảo không ghi đè dữ liệu cũ.

<!-- [DÁN ẢNH GIAO DIỆN Ở ĐÂY] 
  (Chụp giao diện trang quản lý thông tin User của Admin) 
-->

## 4.4. Giải quyết các thách thức kỹ thuật trọng tâm (Lịch sử Optimal)

Quá trình xây dựng Next.js Application quy mô lớn đặt ra nhiều bài toán lớn về hiệu năng (Performance) và tính tương thích, đã được nhóm phát triển giải quyết triệt để thông qua các tác vụ sau:

### Vấn đề 1: Lệch pha Hydration và lỗi Render Theme chớp tắt
Hệ thống sử dụng cơ chế Light/Dark theme theo cài đặt gốc (System Preferences). Tuy nhiên, vì Next.js thực hiện Pre-render UI ở phía Server (nơi không biết người dùng đang dùng Light hay Dark style), nên khi giao diện tải về Client, trình duyệt nhận thấy sự sai lệch mã HTML (Hydration mismatch) dẫn đến lỗi màn hình FOUC (Flash of unstyled content) và phá vỡ cấu trúc CSS nội tuyến.

*Cách giải quyết đắc lực:* Áp dụng chiến thuật Rendering trì hoãn kiểm soát (Mounted State Deferral).
```javascript
// Giải pháp kỹ thuật Theme Injection hạn chế mất đồng bộ Hydration
export default function ThemeContextWrapper({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Chỉ kích hoạt render sâu sau khi DOM đã được gắn kết ở phía Client
    setMounted(true);
  }, []);

  if (!mounted) {
    // Trả về không gian ẩn (Invisible wrapper) hoặc Skeleton để đợi server sync
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return <ThemeProvider attribute="class">{children}</ThemeProvider>;
}
```
Chiến thuật này tạo ra hiệu ứng chuyển tiếp mượt mà, giúp dự án vượt qua kiểm duyệt Linting khắt khe của quy trình Build Production.

### Vấn đề 2: Thanh lọc hàm Rendering không tinh khiết (Impure Functions) & Fix Build Error
Trong một phân hệ (như trang giao diện định dưỡng Nutrition Page của dự án lúc xây dựng), dự án vấp phải hiện tượng tràn vòng lặp gọi hàm (Infinite Loop) và Import module bị thiếu. Điều này gây đứng tiến trình `Next build` chạy kiểm thử trên pipeline CI/CD.

Nguyên nhân xuất phát từ việc khởi tạo State trực tiếp bên trong Vòng đời Render thay vì bọc trong `useEffect` và lỗi đè Component. 
Nhóm đã tiến hành Audit (Kiểm toán) lại hệ thống, tinh gọn hàng ráo luồng render của hệ thống Trang trí Theme (Theme Provider decor), biến các hàm Render UI thành Code tinh khiết (Pure function - Chỉ nhận Props và trả về giao diện mà không Side-effects cục bộ). Lỗi này được dập tắt, giúp quá trình nâng cấp vòng đời dự án (Build Deploy) diễn ra ổn định, giảm tải RAM của máy chủ biên dịch từ 2.4GB xuống ngưỡng quy chuẩn an toàn.
