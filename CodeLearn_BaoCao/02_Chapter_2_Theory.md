# CHƯƠNG 2. KIẾN TRÚC HỆ THỐNG VÀ CƠ SỞ LÝ THUYẾT CÔNG NGHỆ

Việc lựa chọn công nghệ cho CodeLearn không dựa trên sự phổ biến nhất thời mà dựa trên các nguyên lý kỹ thuật bền vững: **Tính cô lập (Isolation), Tính bất đồng bộ (Asynchronicity) và Khả năng mở rộng (Scalability)**. Chương này phân tích sâu các quyết định kiến trúc đã hình thành nên sức mạnh của hệ thống.

### 2.1. Chuyển dịch kiến trúc: Từ Monolithic đến Microservices

Trong giai đoạn thiết kế sơ khởi, chúng tôi đã cân nhắc giữa kiến trúc nguyên khối (Monolithic) và kiến trúc phân tán. 
- **Quyết định:** CodeLearn áp dụng mô hình **Distributed Modular Monolith** hướng tới Microservices.
- **Lý do:** Việc chấm bài (Execution) là một tác vụ cực kỳ tiêu tốn tài nguyên và tiềm ẩn rủi ro bảo mật. Nếu tích hợp chung vào một server API, một đoạn code "vòng lặp vô hạn" của sinh viên có thể làm treo toàn bộ hệ thống web. 
- **Giải pháp:** Tách biệt hoàn toàn `API Server` và `Worker Nodes`. Hai thành phần này giao tiếp thông qua một lớp đệm hàng đợi (Message Broker).

### 2.2. Phân tích Tầng Giao diện (Frontend - Next.js 15)

CodeLearn sử dụng Next.js 15 với App Router làm nền tảng phát triển giao diện.
- **Server Components (RSC):** Giúp giảm thiểu lượng JavaScript gửi xuống Client, tăng tốc độ render các trang tĩnh như Dashboard hay Thông tin khóa học.
- **Client Components:** Sử dụng cho các thành phần đòi hỏi tương tác cao như Code Editor, Real-time Battle.
- **State Management:** Kết hợp giữa `React Query` (quản lý trạng thái server) và `Zustand` (quản lý trạng thái client nhẹ nhàng). Việc sử dụng React Query giúp giải quyết bài toán Caching dữ liệu cực kỳ hiệu quả, giảm 60% số lượng request trùng lặp lên Server.

### 2.3. Phân tích Tầng Nghiệp vụ (Backend - NestJS)

NestJS được chọn làm "bộ não" của hệ thống vì khả năng quản lý dependency cực tốt (Dependency Injection).
- **Module-based Design:** Mỗi tính năng (Auth, Problem, Submission, AI) được đóng gói trong một Module riêng biệt. Điều này cho phép nhiều lập trình viên cùng tham gia phát triển mà không gây xung đột mã nguồn.
- **TypeORM & PostgreSQL:** Sự kết hợp này mang lại khả năng quản lý cơ sở dữ liệu quan hệ mạnh mẽ. Chúng tôi sử dụng các kỹ thuật như `Migration` để quản lý sự thay đổi schema và `Indexing` cho các trường dữ liệu hay truy vấn (email, problem_slug, status).

### 2.4. Công nghệ Sandbox và Thực thi an toàn (Docker & Sandbox)

Đây là rào cản bảo mật quan trọng nhất của dự án. Để thực thi code của sinh viên một cách an toàn, chúng tôi áp dụng các kỹ thuật ảo hóa nhẹ (Containerization):
1.  **Isolation (Cô lập):** Mỗi container Docker chạy một bản Linux rút gọn, không có quyền root, không có quyền truy cập file hệ thống của server chính.
2.  **Resource Limits (Giới hạn tài nguyên):** Sử dụng các tham số `--memory` và `--cpus` của Docker để ngăn chặn các cuộc tấn công từ chối dịch vụ (DoS) từ phía sinh viên.
3.  **Hàng đợi BullMQ & Redis:** Đảm bảo các bài nộp được xử lý theo thứ tự FIFO (First In First Out). Nếu hệ thống quá tải, các bài nộp sẽ được xếp hàng thay vì bị hủy bỏ, đảm bảo không mất mát dữ liệu của sinh viên.

### 2.5. Giải pháp Xuất báo cáo học thuật (PrinceXML & Pandoc)

Để phục vụ nhu cầu in ấn và lưu trữ định dạng chuẩn của nhà trường, CodeLearn không sử dụng các thư viện `html2pdf` thông thường (vốn có chất lượng render thấp).
- **Pandoc:** Chuyển đổi dữ liệu thô (Markdown/JSON) sang cấu trúc HTML chuẩn ngữ nghĩa.
- **PrinceXML:** Sử dụng các chuẩn CSS chuyên biệt cho in ấn (Paged Media) để chuyển đổi HTML sang PDF. PrinceXML cho phép tùy chỉnh Header, Footer, Số trang và Font chữ tiếng Việt với độ chính xác tuyệt đối, tương đương với các phần mềm dàn trang chuyên nghiệp.

### 2.6. Trí tuệ nhân tạo và Cơ chế Prompt Engineering

Chúng tôi tích hợp Gemini AI thông qua Google AI SDK. 
- **System Instruction:** Thiết lập một "Persona" cho AI là một trợ giảng khó tính nhưng tận tâm. 
- **Context Injection:** Trước khi gửi câu hỏi của sinh viên lên AI, hệ thống tự động đính kèm thông tin về đề bài, mã nguồn hiện tại và kết quả testcase bị sai. Điều này giúp AI đưa ra những gợi ý cực kỳ sát với thực tế lỗi mà sinh viên đang gặp phải.

***
*Kết luận: Chương 2 đã chứng minh một nền tảng công nghệ vững chắc, được đầu tư nghiên cứu kỹ lưỡng, đảm bảo tính khả thi và bền vững cho dự án CodeLearn trong dài hạn.*
