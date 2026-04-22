# PHẦN 1: BỐI CẢNH VÀ ĐẶT VẤN ĐỀ

## 1.1. Thực trạng giáo dục và phương pháp thực hành lập trình hiện nay
Trong kỷ nguyên công nghệ số, lập trình không chỉ là kỹ năng cốt lõi của sinh viên nhóm ngành Công nghệ Thông tin mà còn dần trở nên phổ cập ở nhiều lĩnh vực khác. Sự chuyển dịch mạnh mẽ của mô hình Công nghệ Giáo dục (EdTech) đã thúc đẩy việc tối ưu hóa cách thức học và thực hành code. Tuy nhiên, tại nhiều cơ sở đào tạo, phương pháp giảng dạy và kiểm tra thực hành lập trình vẫn còn tồn tại nhiều điểm hạn chế, mang tính truyền thống:

- **Hạn chế trong mô hình "Môi trường phân mảnh":** Thông thường, sinh viên thực hành trên các môi trường cục bộ (local environment) bằng các IDE cá nhân như VS Code, IntelliJ, tài liệu và source code được chia sẻ qua file nén `.zip`. Điều này dễn đến lỗi "It works on my machine" (chạy được trên máy tính của tôi nhưng máy người khác thì không) do lệch phiên bản thư viện, môi trường hệ điều hành.
- **Giải pháp thương mại không tối ưu cho học thuật:** Các nền tảng như LeetCode, HackerRank hay CodeSignal giải quyết tốt khâu chấm điểm tự động cho các bài toán thuật toán lẻ (Competitive Programming & Interviewing), nhưng lại thiếu đi tính tùy biến sâu sắc để áp dụng thành một công cụ quản lý lớp học và giảng dạy toàn diện cho một học kỳ.
- **Thiếu sự tích hợp đa định dạng:** Việc quản lý hồ sơ, làm bài và làm báo cáo tổng kết vẫn đang nằm rải rác. Sinh viên thường phải tự chụp màn hình code hoặc copy ra định dạng Word/PDF để nộp lại làm hồ sơ lưu trữ trường học, gây mất thời gian và thiếu đồng bộ.

## 1.2. Phân tích "Nỗi đau" (Pain points) hệ thống đối với các nhóm người dùng
Quá trình số hóa quá trình dạy và học lập trình đòi hỏi một hệ thống giải quyết trực tiếp được những "nỗi đau" của các tác nhân tham gia vào quy trình:

**a. Đối với Giảng viên (Lecturers): Thách thức trong việc kiểm soát mã nguồn bài tập**
- Giảng viên gặp khó khăn lớn khi muốn thiết kế các dạng bài định hướng tư duy như **"Điền vào chỗ trống" (Fill-in-the-blank)**. Dạng bài này yêu cầu sinh viên chỉ được phép chỉnh sửa ở những hàm/từ khóa nhất định thay vì tự do thay đổi toàn bộ chương trình.
- Thực tế, khi giao mã nguồn mẫu (boilerplate code), sinh viên có thể lỡ tay hoặc cố ý xóa, đổi tên file gốc, làm sai lệch cấu trúc biên dịch. Hệ thống hiện tại thiếu cơ chế "Khóa tệp" (File/Workspace constraint) ngay trực tiếp trên trình duyệt để bảo vệ cấu trúc này.

**b. Đối với Quản trị hệ thống (Administrators): Thiếu đồng bộ trong Onboarding**
- Quá trình quản trị khóa học yêu cầu sự tham gia của lượng lớn sinh viên theo từng kỳ. Nếu phải tạo tài khoản thủ công hoặc để sinh viên tự do đăng ký sẽ gây ra rác dữ liệu ảo. 
- Thiếu một luồng *Onboarding chuẩn mực*: Hệ thống cần một cơ chế để Quản trị viên nhập danh sách sinh viên qua CSV (tài khoản chờ), sau đó sinh viên nhận luồng kích hoạt có bảo mật qua Email, xác thực và cấu hình hồ sơ.

**c. Đối với Cấu trúc Hạ tầng (Technical Processing): Rào cản định dạng báo cáo**
- Môi trường đại học đòi hỏi tính hàn lâm và sự lưu trữ tài liệu dưới định dạng văn bản gốc như file Word (`.docx`) hoặc `PDF` nhằm mục đích chấm chéo hoặc in ấn. 
- Việc xây dựng một Engine có khả năng nhận dữ liệu thô (Markdown form) gửi từ phía giao diện, sau đó biên dịch chuẩn xác ra PDF và Word ngay trên Server với độ nét cao, bảo toàn phông chữ tiếng Việt hiện đang là một chi phí tính toán đau đầu.

## 1.3. Mục tiêu giải pháp và Định vị nền tảng CodeLearn

Nhận diện rõ những thách thức nói trên, ứng dụng **CodeLearn** được nghiên cứu và phát triển để thay thế các mô hình rải rác bằng một giải pháp tập trung, chuyên môn hóa cao.

**Mục tiêu cốt lõi:** 
Xây dựng thành công một môi trường lập trình tích hợp ngay trên nền tảng web (Web-based IDE Workspace) không chỉ phục vụ việc gõ lệnh thông thường mà còn quản lý và kiểm soát nghiêm ngặt toàn bộ tiến trình tương tác của một lớp học lập trình.

**Định vị nền tảng:**
CodeLearn không tái tạo lại một LeetCode thứ hai, mà được định vị là **Nền tảng thực hành tích hợp quản trị khóa học mở rộng**, bao gồm:

1. **Không gian thực hành biệt lập (Student IDE):** Trình soạn thảo mã xử lý mượt mà các luồng dữ liệu thời gian thực, có cơ chế cấm tự ý thao tác lên tệp cấu trúc lõi của bài toán.
2. **Dashboard thông minh cho Giáo viên (Lecturer Analytics):** Nơi khởi tạo linh hoạt nhiều dạng bài tập lập trình khác nhau, đặc biệt hỗ trợ quy trình gắn mã độc quyền "Fill-in-the-blank".
3. **Cơ chế xử lý tài liệu đa năng (Core Documents Engine):** Tích hợp công nghệ cao (`Pandoc` và `PrinceXML`) để chuyển đổi linh hoạt dữ liệu Markdown, Code sang chuẩn PDF hoặc Word, tự động hóa quy trình nộp báo cáo thực hành của sinh viên.
4. **Hệ thống Onboarding bảo mật:** Quản trị đăng ký vòng đời người dùng khép kín có sự tham gia của Admin bằng luồng sinh mã tạm thời (Temporary Credentials).

Qua đó, CodeLearn sẽ đóng vai trò như cầu nối đắc lực, giảm tải áp lực quản lý rườm rà, để người dạy và người học có thể toàn tâm tập trung vào nhiệm vụ duy nhất: **Duy trì và phát triển tư duy logic lập trình.**
