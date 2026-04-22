# CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

### 3.1. Phân tích yêu cầu chức năng
Hệ thống "CodeLearn" được thiết kế nhằm phục vụ môi trường giáo dục đại học với 3 tác nhân chính:

1.  **Sinh viên (Student):** 
    - Đăng nhập qua hệ thống Google OAuth.
    - Thực hành trên IDE trực tuyến: Hỗ trợ viết mã, chạy thử với input tùy chỉnh và nộp bài.
    - Tương tác với AI: Nhận giải thích về lỗi logic và gợi ý sửa bài từ Gemini AI.
    - Theo dõi tiến độ: Xem lịch sử bài làm, điểm số và thứ hạng cá nhân.

2.  **Giảng viên (Lecturer):**
    - Quản lý khóa học (Course management): Tạo và phân loại bài tập theo từng lớp học.
    - Quản lý kho bài tập (Problem management): Soạn thảo đề bài bằng Markdown, cấu hình testcase và ngôn ngữ hỗ trợ.
    - Kiểm tra đạo văn (Plagiarism check): Sử dụng công cụ đối sánh để phát hiện sao chép mã nguồn giữa các sinh viên.
    - Phân tích dữ liệu (Analytics): Theo dõi biểu đồ tiến độ học tập và mức độ khó của các bài tập qua Dashboard.

3.  **Quản trị viên (Admin):** 
    - Quản lý người dùng, phân quyền Role (Student/Lecturer/Admin).
    - Giám sát trạng thái hoạt động của hệ thống và lõi chấm bài.

### 3.2. Thiết kế Cơ sở dữ liệu (ERD)
Dựa trên kiến trúc PostgreSQL, hệ thống được thiết kế với các thực thể quan hệ chặt chẽ:

- **Users:** `id (UUID)`, `fullName`, `email (unique)`, `mssv`, `role`, `rating`, `xp`.
- **Problems:** `id (UUID)`, `title`, `slug (unique)`, `difficulty`, `type`, `createdBy (FK)`, `tags`.
- **Submissions:** `id`, `userId (FK)`, `problemVersionId (FK)`, `code`, `status (PENDING/AC/WA/...)`, `score`, `runtime`, `memory`.
- **Courses:** `id`, `name`, `code`, `semester`, `lecturerId (FK)`.
- **Testcases:** `id`, `problemId (FK)`, `input`, `expectedOutput`, `isSample`.

### 3.3. Quy trình xử lý bài nộp (Submission Workflow)
Quy trình được thiết kế theo cơ chế bất đồng bộ để tối ưu hóa hiệu năng:
1. **Tiếp nhận:** Hệ thống nhận mã nguồn từ Frontend qua REST API.
2. **Hàng đợi (Queue):** Bài nộp được đẩy vào **Redis Queue** thông qua **BullMQ**.
3. **Thực thi (Sandbox):** Worker lấy bài nộp, khởi tạo container Docker cách ly để biên dịch và chạy testcase.
4. **Phản hồi AI:** Nếu bài nộp có lỗi, mã nguồn cùng log lỗi được gửi đến **Gemini AI** để trích xuất gợi ý.
5. **Cập nhật:** Kết quả cuối cùng được lưu vào PostgreSQL và gửi thông báo tới người dùng qua **Socket.io**.

### 3.4. Kiến trúc triển khai (Deployment Architecture)
Hệ thống được đóng gói hoàn toàn bằng **Docker**, bao gồm:
- **Container 1:** Next.js (Frontend).
- **Container 2:** NestJS (Backend API).
- **Container 3:** PostgreSQL (Database).
- **Container 4:** Redis (Caching & Queue).
- **Container 5:** Docker Engine (Dynamic Sandboxing).
- **Nginx:** Đóng vai trò Reverse Proxy và cân bằng tải.
