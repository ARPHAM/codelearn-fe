# CHƯƠNG 4. HIỆN THỰC HÓA HỆ THỐNG VÀ CHI TIẾT GIAO DIỆN NGƯỜI DÙNG

Chương này trình bày chi tiết kết quả thực thi của dự án thông qua hệ thống giao diện người dùng (UI/UX) và các tính năng nghiệp vụ đã được hiện thực hóa. Với quy mô hơn 25 trang chức năng biệt lập, CodeLearn cung cấp một trải nghiệm đồng bộ và chuyên nghiệp cho cả 3 đối tượng tác nhân.

### 4.1. Phân hệ dành cho Sinh viên (Student Experience)

Giao diện sinh viên tập trung vào việc tối ưu hóa hiệu suất học tập và tạo động lực thông qua các yếu tố Gameification (Thi đấu, Xếp hạng).

#### 4.1.1. Không gian làm việc đa năng (The Ultimate Workspace)
Đây là "linh hồn" của hệ thống, nơi sinh viên trực tiếp giải quyết các thách thức lập trình.
- **Trình soạn thảo mã nguồn (Code Editor):** Tích hợp Monaco Editor hỗ trợ hơn 10 ngôn ngữ, tự động gợi ý code (IntelliSense) và tô màu cú pháp chuyên nghiệp.
- **Quản lý đa tệp tin (File Explorer):** Cho phép sinh viên tạo, xóa, đổi tên các tệp tin trong không gian Sandbox cá nhân.
- **Console & Terminal:** Hiển thị luồng dữ liệu Standard Output/Error thời gian thực từ Docker Sandbox.
- **Tab Trợ lý AI (Gemini AI):** Tích hợp cửa sổ chat thông minh, hỗ trợ giải thích lỗi biên dịch ngay tại dòng mã đang viết.
> [ẢNH GIAO DIỆN: Toàn cảnh IDE Workspace với cơ chế Split-pane]

#### 4.1.2. Đấu trường Code Battle (Competitive Coding)
- **Sảnh chờ (Lobby):** Tìm kiếm đối thủ dựa trên hệ thống xếp hạng Elo tương đồng.
- **Giao diện Đối kháng:** Hiển thị màn hình chia đôi, cho phép theo dõi thanh tiến trình (Testcases passed) của đối thủ để tăng tính kịch tính.
- **Kết quả Trận đấu:** Bảng tổng hợp thời gian hoàn thành, số lần submit và điểm thưởng XP/Rating.
> [ẢNH GIAO DIỆN: Giao diện Code Battle thời gian thực]

#### 4.1.3. Lộ trình học tập & Bảng xếp hạng
- **Learning Path (Skill Tree):** Bản đồ kỹ năng trực quan hóa dưới dạng cây. Các nút kỹ năng (Nodes) sẽ mở khóa dần khi sinh viên đạt đủ điểm tích lũy.
- **Leaderboard:** Vinh danh các "lập trình viên" xuất sắc nhất theo tuần, tháng và học kỳ. Hỗ trợ lọc theo lớp học hoặc chuyên ngành.
> [ẢNH GIAO DIỆN: Cây kỹ năng và Bảng xếp hạng Leaderboard]

#### 4.1.4. Các trang chức năng bổ trợ khác
- **Trang Danh sách Bài tập (Problem Set):** Bộ lọc đa năng theo độ khó, ngôn ngữ và trạng thái (Đã làm, Chưa làm).
- **Trang Kỳ thi (Exams):** Giao diện làm bài thi tập trung với cơ chế khóa trình duyệt (Full-screen mode) và giám sát chuyển tab.
- **Trang Khóa học (My Courses):** Quản lý các tài liệu, bài giảng và bài tập về nhà (Assignments) được giảng viên giao.
- **Trang Hồ sơ cá nhân (Profile):** Hiển thị biểu đồ hoạt động (Contribution Graph) tương tự GitHub và kho chứng chỉ ảo.

***

### 4.2. Phân hệ dành cho Giảng viên (Lecturer Management)

Giảng viên được trang bị các công cụ giám sát và phân tích dữ liệu chuyên sâu để đánh giá năng lực sinh viên một cách khách quan nhất.

#### 4.2.1. Dashboard Phân tích & Thống kê (Advanced Analytics)
- **Biểu đồ Hiệu suất:** Thống kê tỷ lệ hoàn thành bài tập theo thời gian thực của cả lớp.
- **Phân tích Bài tập:** Xác định những bài toán nào sinh viên thường xuyên gặp lỗi (Hardest problems) để điều chỉnh giáo án.
> [ẢNH GIAO DIỆN: Biểu đồ Analytics phân tích năng lực sinh viên]

#### 4.2.2. Workbench Giám sát (Auto-Grader Workbench)
- **Giám sát Luồng nộp bài:** Hiển thị danh sách sinh viên đang nộp bài theo thời gian thực (Live stream).
- **Kiểm tra chi tiết:** Cho phép giảng viên mở xem mã nguồn của từng sinh viên, so sánh kết quả thực thi của từng Testcase mà không cần tải lại trang.
> [ẢNH GIAO DIỆN: Giao diện Auto-Grader Workbench dành cho Giám thị]

#### 4.2.3. Quản trị Học liệu & Ngân hàng đề
- **Công cụ Soạn thảo Bài tập:** Hỗ trợ trình soạn thảo Markdown chuyên nghiệp để viết đề bài.
- **Cấu hình Test-case:** Giao diện nhập liệu Input/Output hàng loạt, hỗ trợ tải lên tệp tin dữ liệu lớn.
- **Quản lý Ngân hàng câu hỏi:** Phân nhóm bài tập theo kỹ năng và mức độ nhận biết/thông hiểu/vận dụng.

***

### 4.3. Phân hệ Quản trị viên & Hệ thống (Admin & System Portal)

#### 4.3.1. Quản lý Người dùng & Onboarding
- **Batch Import:** Tải lên danh sách hàng ngàn sinh viên qua CSV và tự động kích hoạt tiến trình gửi Email xác thực.
- **Phân quyền Role:** Chuyển đổi linh hoạt vai trò giữa Giảng viên và Quản trị viên.

#### 4.3.2. Quản trị tài nguyên Sandbox & Bảo mật
- **Sandbox Monitor:** Theo dõi mức độ sử dụng CPU/RAM của hệ thống chấm điểm Docker.
- **Audit Logs:** Hệ thống nhật ký ghi lại mọi thao tác quan trọng (Xóa bài tập, Thay đổi điểm, Đăng nhập lạ).
- **Cấu hình Hệ thống:** Quản lý các biến môi trường, API Keys của Gemini AI, và các tham số giới hạn thực thi (Timeout limits).

***

### 4.4. Giải quyết các Thách thức Kỹ thuật & Tối ưu hóa Hiệu năng

Để báo cáo đạt độ chuyên sâu khoa học, phần này phân tích các nút thắt kỹ thuật đã được tháo gỡ thành công:

1.  **Tối ưu hóa Hydration & Theme Rendering:**
    - Sử dụng `next-themes` kết hợp với chiến lược ngăn chặn render phía server cho các thành phần UI đặc thù (như Editor) để tránh lỗi lệch cấu trúc DOM.
2.  **Xử lý Concurrent Submissions:**
    - Triển khai **BullMQ** với cơ chế hàng đợi ưu tiên. Các bài nộp trong kỳ thi (Exam) sẽ được ưu tiên xử lý trước các bài luyện tập thông thường.
3.  **Tối ưu hóa bộ nhớ cho Code Viewer:**
    - Khi xem lại mã nguồn của sinh viên với hàng trăm file, hệ thống sử dụng Virtual Scrolling để chỉ render các dòng code đang hiển thị trên màn hình, giúp giảm 80% mức sử dụng RAM trình duyệt.
4.  **Bảo mật Sandbox:**
    - Thiết lập cơ chế **Chroot** và **Read-only root filesystem** bên trong container Docker để ngăn chặn tuyệt đối sinh viên đọc các tệp cấu trúc của hệ thống chấm điểm.

***
*Ghi chú: Với hệ thống giao diện đồ sộ và các giải pháp kỹ thuật đi kèm, CodeLearn tự tin đáp ứng tốt các yêu cầu về cả thẩm mỹ lẫn công năng cho một nền tảng EdTech hiện đại.*
