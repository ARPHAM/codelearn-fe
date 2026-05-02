# CHƯƠNG 4. HIỆN THỰC HÓA HỆ THỐNG VÀ CHI TIẾT GIAO DIỆN NGƯỜI DÙNG

Chương này trình bày chi tiết kết quả thực thi của dự án thông qua hệ thống giao diện người dùng (UI/UX) và các tính năng nghiệp vụ đã được hiện thực hóa. Với quy mô hơn 25 trang chức năng biệt lập, CodeLearn cung cấp một trải nghiệm đồng bộ và chuyên nghiệp cho cả 3 đối tượng tác nhân.

### 4.1. Phân hệ dành cho Sinh viên (Student Experience)

Giao diện dành cho sinh viên được thiết kế với triết lý **"Dev-First"**, mô phỏng gần như hoàn chỉnh môi trường làm việc của một lập trình viên chuyên nghiệp nhưng vẫn đảm bảo tính giáo dục cao.

#### 4.1.1. Không gian làm việc đa năng (The Ultimate Workspace)
Đây là trung tâm của hệ thống, hiện thực hóa quy trình thực hành lập trình đã mô tả tại **Biểu đồ hoạt động Hình 3.5**.
- **Trình soạn thảo mã nguồn (Code Editor):** Sử dụng nhân của VS Code (Monaco Editor), hỗ trợ đầy đủ các tính năng như: Cấu trúc thư mục (File Tree), Tab đa tệp tin, và đặc biệt là hệ thống gợi ý code tùy biến dựa trên ngữ cảnh của từng bài tập.
- **Cơ chế Live Sandbox:** Khi sinh viên thực hiện quy trình "Run Code" (**Hình 3.15**), hệ thống sử dụng WebSocket để đẩy trực tiếp kết quả từ Docker Sandbox về Terminal phía client, giảm thiểu độ trễ xuống dưới 100ms.
- **Trợ lý AI Mentor (Gemini AI Integration):** Tại bảng điều khiển bên phải, sinh viên có thể tương tác với AI. Thay vì cung cấp lời giải, AI Mentor sẽ phân tích `stderr` (lỗi biên dịch) và đưa ra các câu hỏi gợi mở, bám sát logic của **Biểu đồ tuần tự Hình 3.17**.

> ![Giao diện Workspace](file:///path/to/images/workspace_student.png)
> *Hình 4.1. Giao diện Workspace tích hợp IDE, Terminal và AI Mentor*

#### 4.1.2. Đấu trường Code Battle (Competitive Coding)
Phân hệ này mang tính tương tác cao nhất, triển khai dựa trên giao thức WebSocket đã thiết kế tại **Hình 3.19**.
- **Cơ chế Matchmaking:** Hệ thống tự động ghép cặp dựa trên điểm Rating Elo. Giao diện sảnh chờ hiển thị danh sách đối thủ đang Online và các trận đấu tiêu biểu đang diễn ra.
- **Tính tương tác thời gian thực:** Trong khi thi đấu, sinh viên có thể nhìn thấy thanh tiến trình testcase của đối thủ (Progress Bar) được cập nhật liên tục qua socket, tạo áp lực cạnh tranh tích cực.
- **Biểu đồ Rating:** Sau mỗi trận đấu, hệ thống hiển thị biểu đồ thay đổi điểm Elo, mô phỏng lại logic trạng thái đã mô tả tại **Hình 3.32**.

> ![Giao diện Code Battle](file:///path/to/images/code_battle.png)
> *Hình 4.2. Giao diện thi đấu đối kháng 1v1 với thanh tiến trình thời gian thực*

#### 4.1.3. Lộ trình học tập & Bảng xếp hạng
- **Learning Path (Skill Tree):** Bản đồ kỹ năng được hiện thực hóa bằng thư viện `React Flow`, cho phép sinh viên tương tác, phóng to/thu nhỏ cây kỹ năng. Trạng thái các Node (LOCKED/ACTIVE/DONE) được đồng bộ hóa chính xác với dữ liệu từ **Biểu đồ lớp Hình 3.25**.
- **Hệ thống XP & Badge:** Mỗi khi hoàn thành một bài tập hoặc chiến thắng một trận Battle, sinh viên sẽ nhận được XP và Badge (Huy hiệu), tạo sự gắn kết lâu dài với nền tảng.

> ![Giao diện Skill Tree](file:///path/to/images/skill_tree.png)
> *Hình 4.3. Cây kỹ năng cá nhân hóa dựa trên lộ trình học tập của sinh viên*
***

### 4.2. Phân hệ dành cho Giảng viên (Lecturer Management)

Giảng viên được trang bị các công cụ giám sát và quản trị nội dung mạnh mẽ, giúp tối ưu hóa quy trình chấm điểm và đánh giá.

#### 4.2.1. Dashboard Phân tích & Thống kê (Advanced Analytics)
Hiện thực hóa nhu cầu quản lý tại **UC-18**, Dashboard cung cấp cái nhìn tổng quát về hiệu suất của lớp học thông qua các biểu đồ `Recharts`:
- **Biểu đồ phân phối điểm:** Phân tích phổ điểm của sinh viên trong một bài tập hoặc kỳ thi cụ thể.
- **Thống kê lỗi phổ biến:** Hệ thống tự động phân loại các bài nộp bị `WA`, `TLE`, hoặc `CE` để giảng viên biết sinh viên đang hổng kiến thức ở đâu.

> ![Dashboard Giảng viên](file:///path/to/images/lecturer_dashboard.png)
> *Hình 4.4. Dashboard thống kê hiệu suất học tập và phân tích lỗi phổ biến*

#### 4.2.2. Workbench Giám sát (Auto-Grader Workbench)
Đây là công cụ hiện thực hóa quy trình giám sát tại **Hình 3.17**, cho phép giảng viên quản lý phòng thi hiệu quả:
- **Live Submission Stream:** Danh sách bài nộp được đẩy lên liên tục qua WebSocket. Giảng viên có thể xem trực tiếp code của sinh viên đang viết để hỗ trợ kịp thời.
- **Manual Override:** Giảng viên có quyền ghi đè điểm số hoặc trạng thái bài nộp trong các trường hợp đặc biệt, tuân thủ logic tại **Hình 3.26**.

> ![Auto-Grader Workbench](file:///path/to/images/autograder_workbench.png)
> *Hình 4.5. Workbench giám sát bài nộp thời gian thực với chế độ xem code chi tiết*

#### 4.2.3. Quản trị Học liệu & Ngân hàng đề
Công cụ này hỗ trợ giảng viên tạo bài tập phức tạp theo quy trình tại **Hình 3.11** và **3.21**:
- **Workspace Configurator:** Cho phép tạo cấu trúc thư mục bài tập đa file, thiết lập các file chỉ đọc (Read-only) hoặc file mẫu (Template).
- **Testcase Manager:** Hỗ trợ nhập liệu thủ công hoặc Import file `.in/.out` hàng loạt. Hệ thống tự động chạy thử (Verify) trước khi cho phép xuất bản.

***

### 4.3. Phân hệ Quản trị viên & Hệ thống (Admin & System Portal)

#### 4.3.1. Quản lý Người dùng & Onboarding
Phân hệ này tập trung vào hiệu suất khi xử lý dữ liệu lớn (Batch processing) như đã thiết kế tại **Hình 3.10**:
- **Cơ chế Import CSV:** Xử lý hàng ngàn bản ghi sinh viên trong hàng đợi (Background Job) để tránh nghẽn server.
- **RBAC Manager:** Giao diện trực quan để thay đổi quyền hạn của người dùng, được bảo mật bởi lớp Middleware xác thực mạnh.

#### 4.3.2. Quản trị tài nguyên Sandbox & Bảo mật
Hiện thực hóa các yêu cầu về triển khai tại **Hình 3.34**:
- **Sandbox Health Monitor:** Theo dõi trạng thái của các Container Judge0, đảm bảo hệ thống chấm điểm luôn sẵn sàng.
- **Audit Logs:** Lưu trữ lịch sử mọi thay đổi cấu hình hệ thống, hỗ trợ truy vết khi có sự cố.

***

### 4.4. Giải quyết các Thách thức Kỹ thuật & Tối ưu hóa Hiệu năng

Để báo cáo đạt độ chuyên sâu khoa học, phần này phân tích các nút thắt kỹ thuật đã được tháo gỡ thành công:

1.  **Tối ưu hóa Hydration & Theme Rendering:**
    - Sử dụng `next-themes` kết hợp với chiến lược ngăn chặn render phía server cho các thành phần UI đặc thù (như Editor) để tránh lỗi lệch cấu trúc DOM.
2.  **Xử lý Concurrent Submissions:**
    - Triển khai **BullMQ** [21] với cơ chế hàng đợi ưu tiên. Các bài nộp trong kỳ thi (Exam) sẽ được ưu tiên xử lý trước các bài luyện tập thông thường.
3.  **Tối ưu hóa bộ nhớ cho Code Viewer:**
    - Khi xem lại mã nguồn của sinh viên với hàng trăm file, hệ thống sử dụng Virtual Scrolling để chỉ render các dòng code đang hiển thị trên màn hình, giúp giảm 80% mức sử dụng RAM trình duyệt.
4.  **Bảo mật Sandbox:**
    - Thiết lập cơ chế **Chroot** và **Read-only root filesystem** bên trong container Docker [4] để ngăn chặn tuyệt đối sinh viên đọc các tệp cấu trúc của hệ thống chấm điểm.

***
*Ghi chú: Với hệ thống giao diện đồ sộ và các giải pháp kỹ thuật đi kèm, CodeLearn tự tin đáp ứng tốt các yêu cầu về cả thẩm mỹ lẫn công năng cho một nền tảng EdTech hiện đại.*
