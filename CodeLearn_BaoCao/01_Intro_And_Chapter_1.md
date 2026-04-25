# PHẦN MỞ ĐẦU VÀ BỐI CẢNH DỰ ÁN

### 1. Tính cấp thiết của đề tài (Rationale)
Trong kỷ nguyên công nghệ số và sự chuyển dịch mạnh mẽ của mô hình Giáo dục trực tuyến (EdTech), lập trình không chỉ giới hạn là một kỹ năng cốt lõi bắt buộc đối với sinh viên nhóm ngành Công nghệ Thông tin, mà còn dần trở nên phổ cập, đóng vai trò nền tảng trong nhiều lĩnh vực khoa học và kỹ thuật khác. Việc tối ưu hóa cách thức học và thực hành mã nguồn là một trong những ưu tiên hàng đầu của các cơ sở giáo dục hiện đại. Tuy nhiên, qua quá trình khảo sát và đánh giá tại các cơ sở đào tạo đại học, phương pháp giảng dạy và kiểm tra thực hành lập trình hiện nay vẫn còn bộc lộ nhiều điểm hạn chế mang tính truyền thống:

- **Hạn chế trong mô hình "Môi trường phân mảnh" (Fragmented Environment):** Thông thường, sinh viên thực hành trên các môi trường cục bộ (local environment) bằng các IDE (Integrated Development Environment) cá nhân như Visual Studio Code, IntelliJ, Eclipse,... Các tài liệu đề bài, bộ dữ liệu (test cases), và source code mẫu thường được chia sẻ qua email hoặc nền tảng học tập dưới dạng file nén `.zip`. Điều này thường xuyên dẫn đến lỗi "It works on my machine" (chạy được trên máy tính của tôi nhưng máy người khác hoặc máy chấm thì không) do lệch phiên bản thư viện, biến môi trường (environment variables), hoặc sự khác biệt về hệ điều hành.
- **Chu trình phản hồi chậm chạp (Delayed Feedback Loop):** Trong quá trình học lập trình, bộ não làm việc theo luồng tư duy liên tục. Sinh viên cần biết kết quả thực thi đoạn mã của mình đúng hay sai ngay lập tức để kịp thời điều chỉnh. Việc nộp bài qua các file tĩnh và chờ đợi giảng viên chấm thủ công làm đứt gãy luồng tư duy, giảm đáng kể hiệu quả tiếp thu kiến thức.
- **Sự bùng nổ của AI và rủi ro đạo văn:** Các công cụ mô hình ngôn ngữ lớn (LLM) hỗ trợ viết code như ChatGPT, GitHub Copilot mang lại những cơ hội to lớn cho việc học tập, nhưng đồng thời cũng thiết lập một rào cản khổng lồ trong việc kiểm soát tính trung thực. Nếu hệ thống không được trang bị bộ phân tích hành vi nộp bài hoặc đối soát mã nguồn tự động, giảng viên gần như không thể phát hiện các trường hợp copy - paste tinh vi.

Đề tài **"Thiết kế và phát triển nền tảng học lập trình trực tuyến thông minh - CodeLearn"** được nghiên cứu và phát triển để thay thế các mô hình rải rác bằng một giải pháp tập trung, chuyên môn hóa cao, tập trung giải quyết bài toán bảo mật không gian làm việc và tích hợp các công nghệ đánh giá tự động (Online Judge) tối tân.

### 2. Phân tích "Nỗi đau" (Pain points) của hệ thống đối với các nhóm người dùng hiện tại

Quá trình số hóa quy trình dạy và học lập trình đòi hỏi một hệ thống giải quyết trực tiếp được những "nỗi đau" của các tác nhân tham gia:

**a. Đối với Giảng viên (Lecturers): Thách thức lớn trong việc thiết kế và kiểm soát mã nguồn bài tập**
- Giảng viên gặp khó khăn rất lớn khi muốn thiết kế các dạng bài định hướng tư duy như **"Điền vào chỗ trống" (Fill-in-the-blank)**. Dạng bài này yêu cầu sinh viên chỉ được phép chỉnh sửa ở những hàm/từ khóa nhất định để rèn luyện một tư duy giải thuật cụ thể (ví dụ: chỉ được phép sửa ruột hàm QuickSort, không được đụng đến cấu trúc khởi tạo mảng ở hàm `main`). Tuy nhiên, việc gửi mã nguồn mẫu (boilerplate code) về máy cá nhân đồng nghĩa với việc mất kiểm soát; sinh viên có thể lỡ tay hoặc cố ý xóa, đổi tên file gốc, làm sai lệch toàn bộ cấu trúc biên dịch khi nộp lại.

**b. Đối với Quản trị hệ thống (Administrators): Thiếu đồng bộ trong Onboarding Sinh viên**
- Quá trình quản trị khóa học yêu cầu sự tham gia của một lượng lớn sinh viên trải dài theo từng kỳ học. Nếu hệ thống mở cửa để sinh viên tự do đăng ký tài khoản (Open Registration), dữ liệu rác (spam data) và các tài khoản ảo sẽ gia tăng không kiểm soát, gây khó khăn cho việc định danh. Hệ thống hiện tại thiếu vắng một quy trình *Onboarding chuẩn mực* - nơi Phòng Đào tạo (Admin) cấp danh sách tài khoản hợp lệ, và quy trình kích hoạt diễn ra khép kín qua thư điện tử có gắn mã thông báo (Secure Tokens).

**c. Đối với Hạ tầng Kỹ thuật (Technical Processing): Rào cản định dạng tài liệu báo cáo**
- Đặc thù của môi trường đại học là đòi hỏi tính hàn lâm cao và sự lưu trữ tài liệu dưới định dạng văn bản gốc như Word (`.docx`) hoặc định dạng bất biến cứng `PDF` nhằm mục đích chấm chéo giữa các bộ môn, kiểm định chất lượng đào tạo (như AUN-QA), hoặc in ấn.
- Việc xây dựng một Engine có khả năng nhận dữ liệu thô (Markup form / Markdown form) gửi từ phía giao diện, sau đó tự động biên dịch chuẩn xác ra PDF và Word ngay trên Server với độ nét nguyên bản, giữ nguyên định dạng bảng biểu, cấu trúc thư mục code, và đặc biệt là bảo toàn phông chữ tiếng Việt hiện đang là một chi phí tính toán "đau đầu" đối với hệ thống hiện hữu.

### 3. Mục tiêu giải pháp và Định vị sản phẩm CodeLearn

**Mục tiêu cốt lõi:**
Thiết kế và xây dựng một nền tảng học tập toàn diện (Web-based IDE Workspace) tích hợp ngay trên trình duyệt, không chỉ phục vụ việc gõ lệnh thông thường mà còn quản lý, kiểm soát tiến trình tương tác, và ứng dụng trí tuệ nhân tạo để mô phỏng "Trợ lý học thuật".

**Định vị nền tảng:**
CodeLearn không tái định nghĩa một LeetCode hay HackerRank thứ hai. CodeLearn được định vị là **Nền tảng thực hành tích hợp quản trị khóa học mở rộng**, tập trung xoáy sâu vào luồng tương tác sư phạm:
1.  **Không gian thực hành biệt lập (Student Web-IDE an toàn):** Trình soạn thảo mã (Code Editor) xử lý mượt mà trên nền web, có cơ chế khóa vùng chỉnh sửa (Read-only chunks) để bảo vệ tệp cấu trúc lõi bài toán, ngăn tự ý thao tác.
2.  **Dashboard thông minh cho Giáo viên (Lecturer Analytics):** Nơi khởi tạo linh hoạt học liệu, cấu hình Test-case, và giám sát tiến độ hoàn thành, nộp bài của sinh viên dựa trên dữ liệu thời gian thực.
3.  **Cơ chế xử lý tài liệu đa năng (Core Documents Engine):** Tích hợp công nghệ cao (`Pandoc` và `PrinceXML`) tự động hóa quy trình nộp báo cáo thực hành.
4.  **Hệ thống Onboarding bảo mật:** Quản trị vòng đời tài khoản (User Lifecycle) khép kín với Temporary Credentials.
5.  **Trợ lý AI hướng dẫn (Gemini AI Companion):** Không giải bài hộ, AI trong CodeLearn đóng vai trò chỉ dẫn tư duy Socratic - giải thích các lỗi logic phức tạp khó phát hiện.

### 4. Đối tượng và Phạm vi nghiên cứu
*   **Đối tượng nghiên cứu:** 
    *   Quy trình vận hành kiến trúc hệ thống cốt lõi phân tán (Microservices) và kỹ thuật đóng gói cách ly (Sandbox / Docker) trong đánh giá mã nguồn.
    *   Ứng dụng Large Language Models (LLM) làm phương pháp sư phạm hiện đại.
    *   Các phương pháp bảo mật toàn vẹn trạng thái Frontend và API giao tiếp.
*   **Phạm vi nghiên cứu:** 
    *   Sản phẩm công nghệ là nền tảng Web Application phục vụ trực tiếp công tác giảng dạy thực hành tại các cơ sở đào tạo đại học. 

### 5. Ý nghĩa khoa học và thực tiễn của đề tài
*   **Về mặt kỹ thuật:** Dự án hiện thực hóa thành công một kiến trúc hiện đại, có tính mở rộng cao, giải quyết được bài toán khó về tách biệt luồng xử lý ứng dụng và luồng thực thi mã nguồn nguy hiểm. Việc tích hợp các Engine xử lý định dạng tài liệu cũng chứng minh tính khả thi của việc tự động hóa toàn diện quy trình làm việc học thuật trên môi trường Web.
*   **Về mặt giáo dục - quản lý:** Sản phẩm giúp giảm tải đến 80% khối lượng công việc chấm bài thủ công, xử lý rác dữ liệu ảo, loại bỏ hoàn toàn các lỗi môi trường phân mảnh. CodeLearn giải phóng thời gian cho giảng viên để họ có thể toàn tâm tập trung vào việc duy nhất: **Duy trì, nâng cấp chất lượng bài giảng và phát triển tư duy logic lập trình cho sinh viên.**

---
\newpage

# CHƯƠNG 1. TỔNG QUAN HỆ THỐNG VÀ KIẾN TRÚC MỞ ĐẦU

### 1.1. Khái quát tổng quan (System Overview)
Sau khi định vị được các "pain points" trong quy trình Giáo dục hiện hữu (đã trình bày ở Phần Mở Đầu), Chương 1 sẽ khái quát hóa các luồng giải pháp kỹ thuật cụ thể mà hệ thống CodeLearn sẽ tiếp cận để giải quyết triệt để các vấn đề này. 
Nền tảng CodeLearn là hệ quả của việc hợp nhất sức mạnh từ hai thế giới: **Hệ thống Online Judge (OJ) truyền thống** mạnh mẽ về đánh giá kỹ thuật và **Công nghệ Web Hiện đại / AI** chuyên sâu về trải nghiệm người dùng và tự động hoá tư duy.

### 1.2. Phân nhỏ các lớp tính năng kỹ thuật

Thay vì cung cấp một ứng dụng nguyên khối rườm rà, năng lực cốt lõi của CodeLearn được thiết kế chia thành các phân lớp luồng tính năng như sau:

**Phân lớp 1: Giao tiếp Hệ thống - Người dùng (The Interface Layer)**
- Hướng tới sự tối giản nhưng không thiếu chuyên nghiệp, giải pháp sử dụng cơ chế Server-Side Rendering (SSR) từ Next.js kết hợp với giao diện Tailwind CSS. Nhu cầu thực tế là sinh viên cần thao tác mượt mà giữa hàng chục tab code mà không giật lag. Góc nhìn kỹ thuật là việc kiểm soát triệt để các chu kỳ kết xuất (Render cycles), giới hạn lỗi Hydration khi sử dụng Theme Provider làm xung đột trạng thái (Dark/Light mode).

**Phân lớp 2: Quản lý Luồng Dữ liệu và Payload (The Application Layer)**
- Hệ thống xây dựng cấu trúc API endpoint RESTful chặt chẽ phân quyền dựa trên JWT Tokens. Dữ liệu (Payload JSON) được phân bổ logic, tối ưu kích thước gói tin gửi về. Ví dụ: khi sinh viên mở bài toán "Điền vào chỗ trống", Server không gửi kèm lời giải mà chỉ gửi cấu trúc dữ liệu mô tả giới hạn (boundaries) cho phép sinh viên gõ lệnh, kết hợp ID bảo vệ. Điều này giúp ngăn chặn triệt để tấn công từ phía Client như cố tình sửa request (Tampering payload).

**Phân lớp 3: Trạm thực thi và đánh giá độc lập (The Execution Engine)**
- Tách biệt hoàn toàn khối backend phục vụ API (NestJS) và hệ thống chấm điểm (Online Judge / Docker). Việc chấm điểm tiêu tốn sức mạnh CPU và có tính rủi ro bảo mật cực cao vì đang chạy "mã nguồn lạ" từ sinh viên. Kiến trúc ở đây là sử dụng Hàng đợi (Message Queue) để tạo lớp đệm, bảo vệ an toàn cho máy chủ chính khỏi tắc nghẽn (DDoS) khi có hàng trăm sinh viên nộp bài đồng loạt trong kỳ thi.

### 1.3. Phương pháp nghiên cứu
Để hiện thực hoá được phân lớp kỹ thuật trên, đề tài áp dụng các phương pháp:
*   **Nghiên cứu tài liệu và lý thuyết:** Rà soát kiến trúc Microservices, kỹ thuật ảo hoá và Isolation qua Sandbox (Docker), và các chuẩn giao tiếp dữ liệu đa dịch vụ (Redis, BullMQ). Cũng như khảo cứu các framework xử lý ngôn ngữ tự nhiên. 
*   **Phân tích và thiết kế:** Xây dựng sơ đồ Use-case, luồng nghiệp vụ (Business Flow), cấu trúc mô hình hóa cơ sở dữ liệu quan hệ (ERD Diagram) phản ánh đa chiều thực thể.
*   **Nghiên cứu thực nghiệm và triển khai:** Xây dựng phần mềm hoàn chỉnh, đánh giá hiệu năng (tốc độ biên dịch file PDF, tốc độ truy xuất cơ sở dữ liệu) và kiểm thử giao diện người dùng.

### 1.4. Kết cấu chi tiết của các chương tiếp theo
Để trình bày một cách tường minh và chuẩn mực trình tự xây dựng sản phẩm, các nội dung kỹ thuật sẽ được tổ chức theo khối như sau:
*   **Chương 2: Cơ sở lý thuyết và Quyết định công nghệ.** Phân tích ưu/nhược điểm trong việc chọn hệ ứng dụng, cơ chế Sandbox và các công nghệ lõi như PrinceXML.
*   **Chương 3: Phân tích nghiệp vụ và Thiết kế hệ thống.** Định nghĩa tác nhân, các luồng tương tác cực kỳ quan trọng như Onboarding Sinh viên, Thuật toán bảo vệ bài tập Boilerplate, và thiết kế Schema CSDL.
*   **Chương 4: Hiện thực hóa không gian học tập và Giao diện.** Chứng minh kết quả đạt được qua giao diện thực tế (Workspace, Analytics) và phân tích các nút thắt kỹ thuật đã được tháo gỡ thành công.
*   **Chương 5: Kết quả đánh giá và Lộ trình.** Khái quát lại những giá trị mang lại và liệt kê các Giai đoạn mở rộng trong tương lai để đưa dự án tới điểm thương mại hóa.
