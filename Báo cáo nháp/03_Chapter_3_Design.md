# CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

### 3.1. Phân tích tác nhân và kịch bản sử dụng (Use Cases)
Hệ thống "CodeLearn" được thiết kế dựa trên sự phân tầng đặc quyền của 3 nhóm tác nhân chính:
1.  **Sinh viên (Student):** Đăng nhập qua OAuth, thực hành trên IDE, tương tác với AI Gemini, nộp bài và xem lịch sử kết quả.
2.  **Giảng viên (Lecturer):** Quản lý khóa học, soạn thảo bài tập Markdown, cấu hình testcase và Boilerplate, theo dõi Dashboard Analytics và kiểm tra đạo văn.
3.  **Quản trị viên (Admin):** Quản lý người dùng tập trung, phân quyền Role và giám sát hạ tầng chấm bài.

<!-- [HÌNH ẢNH 3.1: SƠ ĐỒ USE CASE TỔNG QUÁT] -->
<!-- 
Mã sơ đồ Mermaid tham khảo:
useCaseDiagram
    actor "Sinh viên" as Student
    actor "Giảng viên" as Lecturer
    actor "Quản trị viên" as Admin
    ...
-->

### 3.2. Thiết kế luồng nghiệp vụ cốt lõi (Business Flows)
#### 3.2.1. Quy trình Onboarding Sinh viên khép kín
Để đảm bảo tính xác thực, CodeLearn áp dụng quy trình 3 bước:
1.  **Khởi tạo:** Admin nhập CSV -> Hệ thống tạo tài khoản ở trạng thái `Pending`.
2.  **Kích hoạt:** Hệ thống sinh mã bảo mật tạm thời (Temporary Credentials) và gửi qua Email.
3.  **Xác thực:** Sinh viên kích hoạt link, cập nhật hồ sơ cá nhân và chuyển trạng thái tài khoản sang `Active`.

#### 3.2.2. Luồng bảo mật bài tập "Điền vào chỗ trống"
Đây là giải pháp bảo vệ mã nguồn mẫu (Boilerplate):
1.  **Thiết lập:** Giảng viên khoanh vùng đoạn code được phép sửa (Editable chunks).
2.  **Kiểm soát:** IDE phía Client khóa cứng các vùng không được phép tác động.
3.  **Hòa nhập:** Khi nộp bài, chỉ phần code của sinh viên được gửi về Server -> Server thực hiện trộn mã vào Template an toàn trước khi chấm điểm.

### 3.3. Thiết kế Cơ sở dữ liệu (ERD)
Cấu trúc CSDL PostgreSQL được quy hoạch để tránh dị thường và hỗ trợ mở rộng:
- **Users:** Lưu trữ hồ sơ, MSSV, vai trò và điểm kỹ năng.
- **Problems:** Đặc tả bài toán, mức độ khó và quan hệ với Testcases.
- **Submissions:** Ghi nhận trạng thái bài làm, mã nguồn nộp lên và kết quả từ Sandbox.
- **Courses & Enrollments:** Quản lý mối quan hệ học thuật giữa Môn học, Giảng viên và Sinh viên.

<!-- [HÌNH ẢNH 3.2: SƠ ĐỒ THỰC THỂ MỐI QUAN HỆ - ERD] -->

### 3.4. Phân tích luồng tương tác xử lý bài nộp và AI Gemini
Quy trình nộp bài được thực hiện bất đồng bộ nhằm tối ưu hóa phản hồi:
1.  **Queueing:** Bài nộp được đẩy vào Redis qua BullMQ.
2.  **Execution:** Worker khởi tạo Docker Sandbox, chạy Testcases và so sánh kết quả.
3.  **AI Analysis:** Nếu bài nộp thất bại (WA/TLE), mã nguồn sẽ được gửi đến Gemini AI để nhận phân tích logic và gợi ý sửa lỗi.
4.  **Real-time Update:** Kết quả được đẩy về Frontend qua Socket.io.

<!-- [HÌNH ẢNH 3.3: BIỂU ĐỒ TUẦN TỰ QUY TRÌNH NỘP BÀI VÀ HỖ TRỢ AI] -->

### 3.5. Kiến trúc Triển khai (Deployment Architecture)
Hệ thống được đóng gói hoàn toàn dưới dạng các Docker Container, vận hành sau lớp Nginx Reverse Proxy để đảm bảo bảo mật và cân bằng tải:
- **Frontend Container:** Next.js Application.
- **Backend Container:** NestJS API Service.
- **Database Service:** PostgreSQL.
- **Caching & Queue:** Redis.
- **Sandbox Engine:** Docker Engine dynamic invocation.

<!-- [HÌNH ẢNH 3.4: SƠ ĐỒ KIẾN TRÚC TRIỂN KHAI HỆ THỐNG] -->
