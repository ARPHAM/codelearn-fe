# CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ

### 2.1. Tổng quan về Online Judge và kỹ thuật Sandbox
Hệ thống Online Judge (OJ) là nền tảng cho phép người dùng nộp mã nguồn để thực thi và đánh giá tự động dựa trên các bộ dữ liệu kiểm thử (Test cases). 
*   **Nguyên lý vận hành:** Mã nguồn được đưa vào môi trường cách ly, biên dịch và chạy với đầu vào chuẩn. Kết quả đầu ra được so sánh với đáp án để đưa ra các trạng thái như AC (Accepted), WA (Wrong Answer), TLE (Time Limit Exceeded).
*   **Cơ chế Sandbox:** Dự án sử dụng **Docker containers** để tạo môi trường cách ly tuyệt đối. Mỗi bài nộp được chạy trong một container riêng biệt với các giới hạn về tài nguyên (CPU, RAM, Network), giúp ngăn chặn các hành vi phá hoại hệ thống (DoS, truy cập file bất hợp pháp).

### 2.2. Large Language Models (LLM) và Gemini AI trong giáo dục
Khác với các OJ truyền thống chỉ báo lỗi biên dịch khô khan, dự án ứng dụng **Google Gemini AI** nhằm cá nhân hóa việc học:
*   **Socratic Instruction:** Xây dựng Prompt Engineering để AI đóng vai trò người hướng dẫn, gợi mở tư duy thay vì trực tiếp đưa ra lời giải.
*   **Phân tích lỗi sâu:** AI giúp giải thích các lỗi logic phức tạp (tràn bộ đệm, tham chiếu null) bằng ngôn ngữ tự nhiên, giúp sinh viên nắm vững bản chất cốt lõi của bài toán.

### 2.3. Kỹ thuật phát hiện đạo văn mã nguồn
Để đảm bảo tính trung thực trong học tập, CodeLearn áp dụng các thuật toán phân tích tương đồng:
*   **Tokenization:** Biến đổi mã nguồn thành chuỗi các token để bỏ qua sự thay đổi về tên biến hay khoảng trắng.
*   **Winnowing Algorithm:** Kỹ thuật băm (fingerprinting) mạnh mẽ giúp tìm kiếm các đoạn mã trùng lặp ngay cả khi đã thay đổi cấu trúc vòng lặp cơ bản.

### 2.4. Phân tích lựa chọn Công nghệ (Technology Stack)
Việc lựa chọn công nghệ cho CodeLearn dựa trên các tiêu chí về hiệu suất, bảo mật và khả năng co giãn (Scalability).

#### 2.4.1. Hệ sinh thái Frontend: Next.js & Tailwind CSS
*   **Next.js:** Sử dụng App Router và Server-Side Rendering (SSR) giúp tối ưu hóa tốc độ tải trang bước đầu cho các bài giảng nặng.
*   **Tailwind CSS:** Đảm bảo giao diện hiện đại, chuyên nghiệp và nhất quán trên nhiều thiết bị.

#### 2.4.2. Hệ sinh thái Backend: NestJS & BullMQ
*   **NestJS:** Một framework hướng module mạnh mẽ, giúp mã nguồn dễ bảo trì và mở rộng theo kiến trúc Microservices.
*   **BullMQ & Redis:** Xử lý hàng đợi bất đồng bộ cho hàng ngàn bài nộp cùng lúc, đảm bảo hệ thống backend chính không bị tắc nghẽn khi có tải trọng lớn.

#### 2.4.3. Cơ sở dữ liệu: PostgreSQL
Sử dụng hệ quản trị CSDL quan hệ (RDBMS) giúp quản lý các thực thể có tính liên kết chặt chẽ (Khóa học - Bài tập - Sinh viên) một cách tin cậy thông qua TypeORM.

### 2.5. Tích hợp các bộ nhân kỹ thuật chuyên biệt (Core Engines)
#### 2.5.1. Engine Dịch tài liệu (Pandoc & PrinceXML)
Khác với các thư viện render PDF thông thường dễ lỗi font/layout, dự án kết hợp:
*   **Pandoc:** Biến đổi dữ liệu Markdown sang HTML thô.
*   **PrinceXML:** Công cụ render CSS in ấn chuyên nghiệp, đảm bảo tệp PDF xuất ra vô cùng sắc nét, hỗ trợ đánh số trang và duy trì chuẩn phông tiếng Việt.

#### 2.5.2. Kỹ thuật "Khóa vùng" (Editor Constraint Engine)
Để phục vụ bài tập "Điền vào chỗ trống", hệ thống thiết lập cơ chế **Locking Range**. Phía giao diện nhận Metadata chỉ định chính xác dòng/cột được phép sửa (Read-only chunks), ngăn chặn việc sinh viên xóa/đổi tên file mẫu, đảm bảo tính toàn vẹn của bài toán trước khi chấm điểm.
