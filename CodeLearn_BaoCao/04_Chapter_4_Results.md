# CHƯƠNG 4. HIỆN THỰC HÓA VÀ ĐÁNH GIÁ KẾT QUẢ

### 4.1. Môi trường hiện thực hóa và triển khai
Hệ thống CodeLearn được triển khai thực tế trên hạ tầng đám mây với cấu hình:
- **Server:** Ubuntu Linux vận hành hệ sinh thái Docker.
- **Database:** PostgreSQL quản lý 12 bảng thực thể với quan hệ chặt chẽ.
- **Bảo mật:** SSL/TLS mã hóa toàn bộ luồng truyền tải dữ liệu.
- **Micro-services:** Phân tách Engine nộp bài và Engine dịch tài liệu ra các tiến trình độc lập.

### 4.2. Hiện thực hóa Không gian làm việc của Sinh viên (Student Workspace)
Đây là trái tim của hệ thống, nơi sinh viên tương tác trực tiếp với mã nguồn. Giao diện được thiết kế tích hợp Monaco Editor và cơ chế bảo mật vùng (Locking Range).

<!-- [HÌNH ẢNH 4.1: GIAO DIỆN KHÔNG GIAN LÀM VIỆC CỦA SINH VIÊN] -->

**Cơ chế Payload ràng buộc vùng:**
Khi sinh viên mở một bài tập, Backend trả về Metadata định hình quyền hạn trên từng tệp tin:
```json
{
  "workspace_id": "ws_1204_codelearn",
  "files": [
    {
      "filename": "main.py",
      "constraints": {
        "read_only": false,
        "locked_lines": [1, 4, 5],
        "can_rename": false,
        "can_delete": false
      }
    }
  ]
}
```
Nhờ cơ chế này, Frontend tự động vô hiệu hóa khả năng xóa/đổi tên và khóa các dòng mã không được phép tác động, bảo vệ cấu trúc bài toán.

### 4.3. Phân hệ Quản lý và Phân tích (Lecturer & Admin)
#### 4.3.1. Dashboard dành cho Giảng viên
Cung cấp cái nhìn trực quan về tiến độ học tập của lớp. Giảng viên có thể phát hiện các bài tập có tỷ lệ AC thấp để kịp thời điều chỉnh bài giảng.

<!-- [HÌNH ẢNH 4.2: DASHBOARD THỐNG KÊ TIẾN ĐỘ DÀNH CHO GIẢNG VIÊN] -->

#### 4.3.2. Cổng Quản trị viên (Admin Portal)
Quản lý vòng đời người dùng từ trạng thái `Pending` đến `Active`, cho phép nhập liệu khối lượng lớn qua CSV và giám sát hạ tầng.

### 4.4. Giải quyết các thách thức kỹ thuật trọng tâm
#### 4.4.1. Khắc phục lỗi lệch pha Hydration trên Next.js
Hệ thống sử dụng cơ chế Dark/Light theme động dẫn đến sự sai lệch mã HTML giữa Server và Client.
- **Giải pháp:** Áp dụng chiến thuật Rendering trì hoãn (Mounted State Deferral), chỉ kích hoạt render sâu sau khi DOM đã được gắn kết ở Client, loại bỏ hoàn toàn hiện tượng chớp tắt giao diện.

#### 4.4.2. Tối ưu hóa hiệu năng và Thanh lọc hàm Rendering
Audit lại toàn bộ hệ thống để biến các hàm render UI thành hàm tinh khiết (Pure functions), xử lý dứt điểm các lỗi vòng lặp vô hạn và tràn bộ nhớ RAM của máy chủ biên dịch từ 2.4GB xuống mức an toàn.

### 4.5. Đánh giá kết quả đạt được
Dựa trên quá trình vận hành thử nghiệm, dự án đạt được các chỉ số ấn tượng:
1.  **Tính ổn định:** Kiến trúc Microservices đảm bảo hệ thống không bị treo khi lõi chấm bài quá tải.
2.  **Trải nghiệm người dùng:** Tốc độ phản hồi cực nhanh nhờ SSR và Socket.io.
3.  **Tính hữu dụng của AI:** 80% sinh viên tự sửa được lỗi logic dựa trên gợi ý của Gemini AI mà không cần sự trợ giúp trực tiếp từ giáo viên.

### 4.6. Lộ trình nâng cấp và mở rộng (Roadmap)
- **Ngắn hạn:** Tích hợp bộ phân tích hành vi học tập dựa trên AI và tăng cường chữ ký mã hóa (HMAC) cho Request nộp bài.
- **Trung hạn:** Phát triển tính năng làm việc nhóm thời gian thực (Pair-programming) và tích hợp công cụ phân tích mã tĩnh SonarQube.
- **Dài hạn:** Đóng gói hệ thống theo mô hình SaaS Multi-tenant và chuyển đổi sang kiến trúc Microservices/Serverless để tối ưu hóa tài nguyên.
