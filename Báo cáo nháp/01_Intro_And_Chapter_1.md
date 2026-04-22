# PHẦN MỞ ĐẦU

### 1. Tính cấp thiết của đề tài (Rationale)
Trong kỷ nguyên công nghệ số, lập trình không chỉ là kỹ năng cốt lõi của sinh viên ngành Công nghệ Thông tin mà còn dần trở nên phổ cập ở nhiều lĩnh vực khác. Tuy nhiên, việc giảng dạy và đánh giá lập trình trực tuyến hiện nay vẫn đối mặt với nhiều thách thức như: sự bùng nổ của AI gây rủi ro đạo văn, môi trường thực hành cục bộ thiếu đồng bộ, và quy trình quản trị khóa học chưa được số hóa triệt để. Đề tài "CodeLearn" được phát triển nhằm xây dựng một nền tảng thực hành tích hợp quản trị học tập, giải quyết trực tiếp các bài toán bảo mật và tối ưu hóa quy trình tương tác giữa giảng viên và sinh viên.

### 2. Mục tiêu nghiên cứu (Objectives)
Thiết kế và xây dựng một nền tảng học tập toàn diện (Web-based IDE) tích hợp:
*   Hệ thống chấm bài tự động dựa trên Docker sandbox.
*   Trợ lý học tập thông minh sử dụng Gemini AI.
*   Cơ chế bảo mật bài tập "Fill-in-the-blank" và kiểm soát không gian làm việc.
*   Quy trình Onboarding sinh viên khép kín và hệ thống xuất báo cáo chuẩn học thuật.

### 3. Phương pháp nghiên cứu (Methodology)
*   **Nghiên cứu lý thuyết:** Tìm hiểu về kiến trúc Microservices, kỹ thuật Sandbox (Docker), và các mô hình Large Language Models (LLM).
*   **Nghiên cứu thực nghiệm:** Xây dựng ứng dụng web sử dụng Next.js, NestJS và PostgreSQL; thực hiện kiểm thử tải và đánh giá trải nghiệm người dùng.

### 4. Đối tượng và Phạm vi nghiên cứu
*   **Đối tượng:** Quy trình vận hành Online Judge, ứng dụng AI trong giáo dục, và các kỹ thuật bảo mật mã nguồn.
*   **Phạm vi:** Nền tảng Web Application phục vụ giảng dạy tại các cơ sở đào tạo đại học.

### 5. Kết cấu khóa luận (Research structure)
Ngoài phần mở đầu và kết luận, khóa luận gồm 4 chương:
*   **Chương 1:** Tổng quan về đề tài.
*   **Chương 2:** Cơ sở lý thuyết và Công nghệ.
*   **Chương 3:** Phân tích và Thiết kế hệ thống.
*   **Chương 4:** Hiện thực hóa và Đánh giá kết quả.

\newpage

# CHƯƠNG 1. TỔNG QUAN VỀ ĐỀ TÀI

### 1.1. Lý do lựa chọn đề tài
Sự chuyển dịch mạnh mẽ của mô hình Công nghệ Giáo dục (EdTech) đã thúc đẩy việc tối ưu hóa cách thức học và thực hành code. Tuy nhiên, tại nhiều cơ sở đào tạo, phương pháp giảng dạy vẫn còn tồn tại nhiều điểm hạn chế:
- **Hạn chế trong mô hình "Môi trường phân mảnh":** Sinh viên thực hành trên các môi trường cục bộ dẫn đến lỗi "It works on my machine".
- **Giải pháp thương mại không tối ưu cho học thuật:** Thiếu tính tùy biến sâu để quản lý cả một học kỳ.
- **Thiếu sự tích hợp đa định dạng:** Việc quản lý hồ sơ, làm bài và báo cáo tổng kết nằm rải rác, thiếu đồng bộ.

### 1.2. Phân tích "Nỗi đau" (Pain points) của hệ thống hiện tại
#### 1.2.1. Đối với Giảng viên: Thách thức kiểm soát mã nguồn
Giảng viên khó thiết kế các dạng bài định hướng tư duy như **"Điền vào chỗ trống" (Fill-in-the-blank)** mà không sợ sinh viên can thiệp làm sai lệch cấu trúc biên dịch hoặc xóa tệp tin mẫu (boilerplate code).

#### 1.2.2. Đối với Quản trị hệ thống: Thiếu đồng bộ trong Onboarding
Việc quản lý lượng lớn sinh viên theo kỳ học đòi hỏi một luồng xác thực chuẩn mực từ khâu nhập danh sách đến khi sinh viên kích hoạt tài khoản qua Email.

#### 1.2.3. Đối với Hạ tầng kỹ thuật: Rào cản định dạng báo cáo
Yêu cầu in ấn hồ sơ đại học đòi hỏi việc trích xuất Markdown/Code sang PDF/Word phải đảm bảo phông chữ tiếng Việt và dàn trang chuyên nghiệp.

### 1.3. Định vị sản phẩm CodeLearn
CodeLearn được xác định là một **Nền tảng thực hành tích hợp quản trị khóa học mở rộng**, tập trung vào:
1. **Môi trường Web-IDE an toàn:** Khóa vùng chỉnh sửa (Read-only chunks) để bảo vệ mã mẫu.
2. **Dashboard thông minh:** Giám sát tiến độ và hỗ trợ giảng dạy dựa trên dữ liệu thời gian thực.
3. **Engine xử lý tài liệu đa năng:** Tự động hóa quy trình nộp báo cáo bằng công nghệ Pandoc và PrinceXML.
4. **Trợ lý AI hướng dẫn:** Giúp sinh viên tự giải quyết vướng mắc logic một cách có định hướng.

### 1.4. Ý nghĩa khoa học và thực tiễn của đề tài
*   **Về mặt kỹ thuật:** Hiện thực hóa kiến trúc hiện đại, tách biệt luồng xử lý và thực thi mã nguồn.
*   **Về mặt giáo dục:** Giảm tải 80% khối lượng chấm bài thủ công, cho phép giảng viên tập trung vào cải thiện nội dung chuyên môn và chất lượng giảng dạy.
