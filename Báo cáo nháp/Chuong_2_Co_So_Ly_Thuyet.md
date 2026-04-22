# CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ

### 2.1. Tổng quan về Online Judge và kỹ thuật Sandbox
Hệ thống Online Judge (OJ) là nền tảng cho phép người dùng nộp mã nguồn để thực thi và đánh giá tự động dựa trên các bộ dữ liệu kiểm thử (Test cases). 
*   **Nguyên lý vận hành:** Mã nguồn được đưa vào môi trường cách ly, biên dịch và chạy với đầu vào chuẩn. Kết quả đầu ra được so sánh với đáp án để đưa ra trạng thái (Passed, Wrong Answer, Time Limit Exceeded,...).
*   **Cơ chế Sandbox:** Để đảm bảo an toàn cho máy chủ, dự án sử dụng **Docker containers**. Mỗi bài nộp được chạy trong một container riêng biệt với tài nguyên (CPU, RAM, Network) bị giới hạn nghiêm ngặt, ngăn chặn các hành vi phá hoại như tấn công từ chối dịch vụ (DoS) hoặc truy cập file hệ thống.

### 2.2. Large Language Models (LLM) và Gemini AI trong giáo dục
Khác với các OJ truyền thống chỉ dừng lại ở việc báo lỗi biên dịch, dự án ứng dụng **Google Gemini AI** để tạo ra trải nghiệm học tập thông minh:
*   **Prompt Engineering:** Xây dựng các mẫu câu lệnh chuyên biệt để AI đóng vai trò là người hướng dẫn (tư duy Socratic), không đưa đáp án mà gợi mở cách giải quyết.
*   **Phân tích lỗi sâu:** AI hỗ trợ giải thích các lỗi logic khó phát hiện (như lỗi tràn bộ đệm, lỗi tham chiếu null) bằng ngôn ngữ tự nhiên dễ hiểu cho sinh viên.

### 2.3. Kỹ thuật phát hiện đạo văn mã nguồn
Để đảm bảo tính trung thực, dự án áp dụng các phương pháp phân tích tương đồng:
*   **Tokenization:** Chuyển đổi mã nguồn thành các chuỗi token (từ khóa, định danh, toán tử).
*   **Winnowing Algorithm:** Một kỹ thuật băm (hashing) hiệu quả để tìm các đoạn mã trùng lặp ngay cả khi sinh viên đã đổi tên biến hoặc thay đổi cấu trúc vòng lặp cơ bản.

### 2.4. Công nghệ xây dựng hệ thống
Dự án được xây dựng trên một ngăn xếp công nghệ mạnh mẽ, đảm bảo tính mở rộng:
1.  **Frontend (Next.js):** Sử dụng App Router và Server Components để tối ưu hiệu suất. Giao diện được xây dựng với Tailwind CSS mang lại cảm giác hiện đại, chuyên nghiệp.
2.  **Backend (NestJS):** Một framework hướng module mạnh mẽ, giúp mã nguồn dễ bảo trì và mở rộng.
3.  **Database (PostgreSQL & TypeORM):** Sử dụng hệ quản trị CSDL quan hệ để đảm bảo tính toàn vẹn dữ liệu cho các thực thể phức tạp như Khóa học, Bài làm, và Thống kê.
4.  **Xử lý hàng đợi (BullMQ & Redis):** Khi có hàng trăm bài nộp cùng lúc, BullMQ giúp quản lý hàng chờ thực thi một cách ổn định, tránh gây quá tải cho hệ thống backend chính.
