# CHƯƠNG 4. HIỆN THỰC HÓA GIAO DIỆN VÀ GIẢI QUYẾT THÁCH THỨC KỸ THUẬT

Chương này tập trung trình bày việc hệ thống CodeLearn đã biến đổi các luồng nghiệp vụ trên lý thuyết trở thành một hệ sinh thái giao diện thực tế. Với quy mô hơn 20 module giao diện chính được phân lớp theo từng vai trò (Dashboarding, IDE, Social Interaction, Administration), báo cáo này sẽ liệt kê và phân tích các điểm sáng trong thiết kế trải nghiệm người dùng (UX) và kỹ thuật hiện thực hóa giao diện (Frontend Engineering).

### 4.1. Hệ sinh thái giao diện dành cho Sinh viên (Student Experience)

Môi trường học tập của Sinh viên được thiết kế theo hướng "Gamification" (Trò chơi hóa) để tăng tính tương tác và động lực học tập.

#### 4.1.1. Không gian làm việc lập trình (Core Code Editor)
Giao diện trung tâm nhúng **Monaco Editor**, hỗ trợ đầy đủ các tính năng như VS Code (IntelliSense, Syntax Highlighting).

> [!NOTE]
> **Hình 4.1. Giao diện Workspace tích hợp Trợ lý Gemini AI**
> ![Workspace UI](C:\Users\admin\.gemini\antigravity\brain\5c5b098c-8c18-4d7d-97c3-e8dc52bcf984\student_workspace_mockup_1776932480976.png)
> *Môi trường làm việc tách biệt giữa code mẫu (Read-only) và code sinh viên, có sự hỗ trợ trực tiếp từ AI.*

#### 4.1.2. Lộ trình học tập (Learning Path - Skill Tree)
Thay vì danh sách bài tập nhàm chán, hệ thống cung cấp một bản đồ kỹ năng dạng cây (Graph nodes), giúp sinh viên thấy rõ các mắt xích tri thức cần chinh phục.

> [!NOTE]
> **Hình 4.2. Giao diện Lộ trình học tập dựa trên đồ thị kỹ năng**
> ![Learning Path UI](C:\Users\admin\.gemini\antigravity\brain\5c5b098c-8c18-4d7d-97c3-e8dc52bcf984\learning_path_skill_tree_mockup_1776932759877.png)

#### 4.1.3. Chế độ Thi đấu và Tương tác (Battle Mode & Pair Programming)
- **Code Battle:** Giao diện đối kháng thời gian thực, nơi sinh viên so tài trực tiếp để tích điểm XP và tăng hạng trên Leaderboard.
- **Pair Programming:** Không gian lập trình cặp qua các "Rooms", dùng công nghệ Socket.io để đồng bộ mã nguồn giữa hai người học.

> [!NOTE]
> **Hình 4.3. Giao diện Đấu trường Code-Battle**
> ![Battle Mode UI](C:\Users\admin\.gemini\antigravity\brain\5c5b098c-8c18-4d7d-97c3-e8dc52bcf984\battle_mode_mockup_1776932548013.png)

### 4.2. Phân hệ Quản trị Học liệu của Giảng viên (Lecturer Terminal)

Giảng viên được cung cấp bộ công cụ mạnh mẽ để quản lý và giám sát chất lượng đào tạo.

#### 4.2.1. Dashboard Analytics
Hệ thống hóa dữ liệu tiến độ của cả lớp thông qua các biểu đồ trực quan, giúp phát hiện sớm các sinh viên gặp khó khăn.

> [!NOTE]
> **Hình 4.4. Bảng phân tích dữ liệu học tập**
> ![Lecturer Dashboard](C:\Users\admin\.gemini\antigravity\brain\5c5b098c-8c18-4d7d-97c3-e8dc52bcf984\lecturer_dashboard_mockup_1776932506962.png)

#### 4.2.2. Kiểm soát Đạo văn và Chấm điểm tự động (Plagiarism & Auto Grader)
- **Plagiarism Module:** Giao diện so sánh song song mã nguồn giữa các sinh viên, hiển thị tỷ lệ tương đồng chi tiết theo từng dòng code.
- **Auto Grader:** Cấu hình các bộ Test-case bảo mật, giới hạn tài nguyên chạy (Time limit, Memory limit).

> [!NOTE]
> **Hình 4.5. Giao diện đối chiếu và phát hiện Đạo văn mã nguồn**
> ![Plagiarism UI](C:\Users\admin\.gemini\antigravity\brain\5c5b098c-8c18-4d7d-97c3-e8dc52bcf984\plagiarism_check_ui_mockup_1776932846499.png)

### 4.3. Cổng Quản trị Hệ thống (Admin Portal)

Dành cho kỹ thuật viên và người quản lý cấp cao để giám sát hạ tầng và luồng người dùng.

- **Users Management:** Quản lý danh sách hàng nghìn sinh viên, hỗ trợ Batch Import qua CSV.
- **Audit Logs:** Ghi chép mọi hành động nhạy cảm trên hệ thống để phục vụ hậu kiểm.
- **Sandbox Monitor:** Giám sát trạng thái của các Docker Container trong quá trình chấm bài.

> [!NOTE]
> **Hình 4.6. Giao diện Quản trị viên hệ thống**
> ![Admin Portal UI](C:\Users\admin\.gemini\antigravity\brain\5c5b098c-8c18-4d7d-97c3-e8dc52bcf984\admin_portal_mockup_1776932595282.png)

### 4.4. Giải quyết các thách thức kỹ thuật trọng tâm

#### 4.4.1. Tối ưu hóa Hydration cho Client-side Component
Hệ thống sử dụng cơ chế xử lý trì hoãn (Client-only mounting) để triệt tiêu lỗi chớp tắt giao diện (Flash of Content) khi sử dụng Server Side Rendering (SSR) kết hợp với Theme Dark/Light.

#### 4.4.2. Cơ chế Re-validation dữ liệu thời gian thực
Sử dụng SWR (Stale-While-Revalidate) và WebSockets để đảm bảo các dữ liệu như kết quả nộp bài, thứ hạng thi đấu luôn được cập nhật mới nhất mà không cần tải lại trang.

#### 4.4.3. Tối ưu hóa dung lượng Build và Performance
Áp dụng cơ chế Code Splitting và Lazy Loading cho các Component nặng như Monaco Editor và các thư viện đồ thị Chart.js, giúp giảm 65% dung lượng Initial Bundle của trang.
