# CHƯƠNG 1. TỔNG QUAN VỀ ĐỀ TÀI

## 1.1. Đặt vấn đề và Lý do chọn đề tài

Trong kỷ nguyên của nền kinh tế tri thức, Công nghệ Thông tin (CNTT) đóng vai trò là "hệ điều hành" của xã hội hiện đại. Sự phát triển thần tốc của các công nghệ như Trí tuệ nhân tạo (AI), Dữ liệu lớn (Big Data) và Điện toán đám mây (Cloud Computing) đã thúc đẩy nhu cầu về nguồn nhân lực lập trình chất lượng cao trên toàn cầu. Tại Việt Nam, mục tiêu chuyển đổi số quốc gia theo **Quyết định số 749/QĐ-TTg của Thủ tướng Chính phủ** đã đặt giáo dục đại học vào tâm thế phải đổi mới căn bản và toàn diện, đặc biệt là trong công tác đào tạo các ngành kỹ thuật.

Tuy nhiên, qua khảo sát thực tế tại nhiều cơ sở đào tạo, quy trình dạy và học lập trình hiện nay vẫn đang vấp phải những rào cản mang tính hệ thống, làm hạn chế khả năng phát triển tư duy của sinh viên:

### 1.1.1. Sự bất cập của các công cụ quản lý học tập truyền thống
Hầu hết các trường đại học hiện nay đang sử dụng các hệ thống quản lý học tập (LMS) như Moodle hoặc Google Classroom. Mặc dù các hệ thống này hỗ trợ tốt việc lưu trữ tài liệu và thu bài tập, nhưng chúng hoàn toàn thiếu hụt các tính năng chuyên biệt cho lập trình như: biên dịch mã nguồn trực tuyến, kiểm thử tự động (Auto-testing) hay phân tích độ phức tạp thuật toán. Điều này khiến giảng viên phải tải từng bài tập về máy cục bộ để chấm điểm thủ công, dẫn đến tình trạng quá tải và thiếu nhất quán trong đánh giá.

### 1.1.2. Khoảng cách về môi trường thực thi và phản hồi
Việc học lập trình đòi hỏi sự thực hành liên tục và phản hồi tức thì (Instant Feedback). Tuy nhiên, sinh viên thường mất quá nhiều thời gian vào việc cấu hình môi trường (Environment setup) thay vì tập trung vào tư duy logic. Theo các nghiên cứu về tâm lý học giáo dục và thực nghiệm AI trong STEM [1], [2], việc nhận phản hồi chậm sau khi hoàn thành nhiệm vụ làm giảm động lực học tập và khả năng ghi nhớ lỗi sai. Một hệ thống lý tưởng cần phải xóa bỏ rào cản về cài đặt và cung cấp kết quả chấm điểm chỉ trong vài giây sau khi nộp bài.

### 1.1.3. Thách thức đạo đức và học thuật trong kỷ nguyên AI
Sự ra đời của các mô hình ngôn ngữ lớn (LLM) như ChatGPT và Gemini [3] đã thay đổi hoàn toàn cách sinh viên tiếp cận bài tập. Thay vì tự tư duy, sinh viên có xu hướng lạm dụng AI để lấy lời giải có sẵn. Điều này đòi hỏi một hệ thống học tập mới không chỉ biết "chấm điểm đúng sai" mà còn phải đóng vai trò là một "người hướng dẫn thông minh", biết sử dụng AI để gợi mở tư duy thay vì cung cấp kết quả cuối cùng.

Xuất phát từ những trăn trở trên, dự án **CodeLearn** được hình thành với sứ mệnh kiến tạo một nền tảng thực hành lập trình hiện đại, nơi công nghệ AI và các quy trình tự động hóa được kết hợp hài hòa để tối ưu hóa trải nghiệm dạy và học.

## 1.2. Mục tiêu nghiên cứu

### 1.2.1. Mục tiêu tổng quát
Thiết kế và hiện thực hóa hệ thống CodeLearn - một nền tảng Web-based quản trị thực hành lập trình toàn diện, hỗ trợ giảng viên trong việc tổ chức đào tạo và giúp sinh viên rèn luyện kỹ năng thông qua cơ chế phản hồi tức thì và trợ lý AI thông minh.

### 1.2.2. Mục tiêu cụ thể
1.  **Xây dựng môi trường thực thi an toàn (Sandbox):** Nghiên cứu và triển khai cơ chế cô lập mã nguồn bằng công nghệ Container (Docker) [4], đảm bảo hệ thống có thể thực thi mã nguồn lạ mà không ảnh hưởng đến an ninh máy chủ.
2.  **Tự động hóa đánh giá đa ngôn ngữ:** Hỗ trợ chấm điểm tự động cho các ngôn ngữ phổ biến (C/C++, Java, Python, JavaScript) với độ chính xác tuyệt đối dựa trên bộ testcase mẫu.
3.  **Tối ưu hóa quy trình tương tác AI:** Xây dựng hệ thống Prompt Engineering để kết nối với Gemini AI, cung cấp các hướng dẫn sửa lỗi logic chuẩn sư phạm cho sinh viên.
4.  **Phát triển hệ thống Dashboard phân tích:** Trực quan hóa tiến độ học tập qua mô hình Skill Tree (Cây kỹ năng), giúp định danh chính xác điểm mạnh và điểm yếu của từng cá nhân.
5.  **Đảm bảo hiệu năng cao:** Hệ thống phải duy trì độ trễ thấp ngay cả khi số lượng truy cập đồng thời tăng cao trong các kỳ thi tập trung.

## 1.3. Đối tượng nghiên cứu

Đề tài tập trung nghiên cứu các khía cạnh kỹ thuật và nghiệp vụ sau:
- **Kỹ thuật thực thi mã nguồn trực tuyến:** Nghiên cứu về kiến trúc của các hệ thống Online Judge, cơ chế xử lý hàng đợi (Message Queue) và phân phối job chấm bài.
- **An ninh hệ thống:** Nghiên cứu các kỹ thuật Sandbox, Linux Namespaces, Cgroups để kiểm soát tài nguyên thực thi (CPU, RAM).
- **Trí tuệ nhân tạo trong giáo dục (AIEd):** Nghiên cứu cách ứng dụng mô hình ngôn ngữ lớn để phân tích mã nguồn và hỗ trợ học tập cá nhân hóa.
- **Trải nghiệm người dùng (UX) trên nền Web:** Nghiên cứu kiến trúc Single Page Application (SPA) với Next.js để tối ưu tốc độ tương tác.

## 1.4. Phạm vi nghiên cứu

### 1.4.1. Phạm vi về đối tượng sử dụng
Hệ thống hướng tới ba nhóm đối tượng chính:
- **Sinh viên:** Người thực hành, làm bài tập và tham gia các kỳ thi.
- **Giảng viên:** Người tạo đề bài, quản lý lớp học và giám sát tiến độ.
- **Quản trị viên:** Người vận hành hệ thống, quản lý người dùng và hạ tầng máy chủ.

### 1.4.2. Phạm vi về chức năng
Hệ thống tập trung vào các phân hệ cốt lõi:
- **Module Học tập:** Quản lý bài tập theo chủ đề, lưu vết lịch sử nộp bài và hiển thị cây kỹ năng.
- **Module Thực thi (The Engine):** Biên dịch và chạy mã nguồn đa tệp tin, so khớp kết quả output.
- **Module Cộng tác (Collaboration):** Cho phép tạo phòng học chung, chia sẻ mã nguồn thời gian thực qua WebSockets.
- **Module AI Mentor:** Phân tích lỗi biên dịch và lỗi logic, đưa ra gợi ý gợi mở.

### 1.4.3. Phạm vi về phi chức năng
- **Độ tin cậy:** Kết quả chấm bài phải đảm bảo tính khách quan và lặp lại được.
- **Tính bảo mật:** Mã nguồn sinh viên nộp phải được mã hóa và lưu trữ an toàn.
- **Tính tương thích:** Hệ thống hoạt động tốt trên các trình duyệt hiện đại (Chrome, Edge, Firefox).

### 1.4.4. Các vấn đề ngoài phạm vi
- Đề tài không tập trung vào việc thay thế hoàn toàn giảng viên mà chỉ đóng vai trò công cụ hỗ trợ.
- Không nghiên cứu sâu về các bài toán đặc thù như chấm điểm các ứng dụng có giao diện đồ họa (GUI) hay lập trình phần cứng.

## 1.5. Phương pháp nghiên cứu

Để thực hiện đề tài này, nhóm tác giả đã kết hợp các phương pháp nghiên cứu sau:
1.  **Phương pháp nghiên cứu lý thuyết:** Thu thập và phân tích các tài liệu khoa học về kiến trúc Online Judge, các tiêu chuẩn an ninh Sandbox và các bài báo về ứng dụng AI trong giáo dục.
2.  **Phương pháp khảo sát thực tế:** Phân tích các hệ thống hiện có như LeetCode, Codeforces để rút ra các ưu điểm và hạn chế.
3.  **Phương pháp chuyên gia:** Tham khảo ý kiến của các giảng viên bộ môn để xây dựng quy trình quản lý bài tập sát với thực tế giảng dạy.
4.  **Phương pháp thực nghiệm:** Xây dựng prototype (bản thử nghiệm), tiến hành chạy thử và tinh chỉnh dựa trên kết quả đo lường hiệu năng.

## 1.6. Ý nghĩa khoa học và thực tiễn của đề tài

- **Ý nghĩa khoa học:** Đề tài góp phần chuẩn hóa mô hình hệ thống học tập lập trình tích hợp AI, đưa ra giải pháp kỹ thuật cụ thể cho việc kết hợp giữa công nghệ Sandbox và LLM.
- **Ý nghĩa thực tiễn:** Tạo ra một công cụ hữu ích cho các khoa đào tạo CNTT, giúp nâng cao chất lượng dạy và học, giảm tải công việc hành chính cho giảng viên và tạo hứng khởi cho sinh viên thông qua các tính năng tương tác hiện đại.

## 1.7. Cấu trúc của đồ án

Đồ án được chia thành 5 chương chính:
- **Chương 1:** Tổng quan về đề tài (Lý do, mục tiêu, phạm vi).
- **Chương 2:** Cơ sở lý thuyết và công nghệ sử dụng (Nghiên cứu về Docker, NestJS, Next.js, AI Gemini).
- **Chương 3:** Phân tích và thiết kế hệ thống (Phân tích Use Case, ERD, Sequence Diagram).
- **Chương 4:** Hiện thực hóa và kết quả triển khai (Giới thiệu các giao diện, chức năng đã hoàn thành).
- **Chương 5:** Kết luận và hướng phát triển (Đánh giá kết quả đạt được và những dự định trong tương lai).
