# CHƯƠNG 1. TỔNG QUAN VỀ ĐỀ TÀI

### 1.1. Đặt vấn đề
Trong kỷ nguyên số, kỹ năng lập trình đã trở thành một trong những năng lực cốt lõi không chỉ đối với sinh viên ngành Công nghệ thông tin mà còn đối với nhiều lĩnh vực kỹ thuật khác. Tuy nhiên, việc giảng dạy và đánh giá lập trình tại các cơ sở đào tạo đại học hiện nay đang đối mặt với những thách thức mới:
1.  **Chu trình phản hồi chậm:** Sinh viên cần biết kết quả bài làm ngay lập tức để duy trì luồng tư duy. Việc chấm bài thủ công của giảng viên thường mất nhiều thời gian, làm giảm hiệu quả tiếp thu.
2.  **Sự bùng nổ của AI:** Các công cụ như ChatGPT, GitHub Copilot mang lại cơ hội nhưng cũng đặt ra thách thức về **đạo văn mã nguồn**. Hệ thống cần có khả năng phát hiện các hành vi gian lận tinh vi để đảm bảo tính công bằng.
3.  **Nhu cầu hỗ trợ cá nhân hóa:** Giảng viên không thể hỗ trợ chi tiết lỗi sai cho hàng trăm sinh viên cùng lúc. Do đó, một "Trợ lý ảo" tích hợp ngay trong hệ thống là cực kỳ cần thiết.

Đề tài **"Thiết kế và phát triển nền tảng học lập trình trực tuyến thông minh - CodeLearn"** được thực hiện nhằm giải quyết các vấn đề trên bằng cách kết hợp sức mạnh của hệ thống Online Judge truyền thống với các công nghệ AI hiện đại.

### 1.2. Mục tiêu nghiên cứu
Mục tiêu chính của đề tài là xây dựng một nền tảng học tập toàn diện, không chỉ dừng lại ở việc chấm điểm mà còn hỗ trợ quá trình học tập thông minh. Các mục tiêu cụ thể bao gồm:
*   **Hệ thống chấm bài tự động:** Hỗ trợ đa ngôn ngữ (C++, Java, Python, JavaScript,...) với độ trễ thấp và độ tin cậy cao dựa trên Docker sandbox.
*   **Tích hợp Trợ lý AI (Gemini):** Tự động phân tích mã nguồn sinh viên nộp lên, giải thích các lỗi logic và gợi ý hướng tối ưu mà không tiết lộ trực tiếp đáp án.
*   **Phát hiện đạo văn (Plagiarism Detection):** Áp dụng các thuật toán so sánh cấu trúc mã nguồn để phát hiện các trường hợp sao chép bài làm.
*   **Quản lý và Phân tích (Analytics):** Cung cấp hệ thống Dashboard theo dõi tiến độ, thống kê tỷ lệ hoàn thành và mức độ khó của bài tập theo thời gian thực cho giảng viên.

### 1.3. Đối tượng và Phạm vi nghiên cứu
*   **Đối tượng nghiên cứu:** 
    *   Quy trình vận hành của các hệ thống Online Judge hiện đại.
    *   Ứng dụng Large Language Models (LLM) trong giáo dục.
    *   Các phương pháp so sánh và phát hiện tương đồng mã nguồn.
*   **Phạm vi nghiên cứu:** 
    *   Người dùng: Sinh viên và giảng viên tại các cơ sở đào tạo CNTT.
    *   Nền tảng: Web Application (Next.js, NestJS, PostgreSQL).

### 1.4. Đóng góp của đề tài
*   **Về mặt kỹ thuật:** Hiện thực hóa kiến trúc Microservices tách biệt giữa luồng xử lý nghiệp vụ và luồng thực thi mã nguồn. Sử dụng **PostgreSQL** để quản lý dữ liệu quan hệ phức tạp giữa Khóa học - Bài tập - Sinh viên một cách tối ưu hơn so với các hệ thống cũ dùng NoSQL.
*   **Về mặt giáo dục:** Tạo ra mô hình học tập "Hỗ trợ 24/7" thông qua AI, giúp sinh viên tự học mọi lúc mọi nơi nhưng vẫn nằm trong sự kiểm soát và đánh giá sát sao của giảng viên.
*   **Về mặt quản lý:** Giảm thiểu 80% khối lượng công việc chấm bài và kiểm soát gian lận thủ công, giúp giảng viên tập trung vào việc cải thiện nội dung chuyên môn.
