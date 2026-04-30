# CHƯƠNG 1. KHỞI NGUỒN Ý TƯỞNG VÀ ĐỊNH HƯỚNG GIẢI PHÁP CHI TIẾT

### 1.1. Bối cảnh thực tiễn của Giáo dục Công nghệ Thông tin

Trong thập kỷ qua, ngành giáo dục Công nghệ Thông tin (CNTT) đã chứng kiến một sự chuyển dịch mạnh mẽ từ các mô hình học tập tập trung tại giảng đường sang các mô hình học tập trực tuyến và linh hoạt (Blended Learning). Tuy nhiên, đặc thù của việc dạy và học lập trình không chỉ dừng lại ở việc đọc tài liệu hay xem video, mà cốt lõi nằm ở quá trình **"Thực hành - Phản hồi - Hiệu chỉnh"**.

Hiện nay, tại đa số các cơ sở đào tạo đại học, quy trình thực hành lập trình vẫn đang gặp phải sự đứt gãy về mặt công nghệ. Sinh viên thường phải đối mặt với các rào cản về môi trường cài đặt, trong khi giảng viên lại quá tải với khối lượng chấm bài thủ công khổng lồ. Sự ra đời của dự án **CodeLearn** là một lời giải cho bài toán hợp nhất không gian số, tạo ra một cầu nối công nghệ vững chắc giữa người dạy và người học.

### 1.2. Phân tích chi tiết các "Nỗi đau" (Pain points) của hệ thống hiện tại

Để xây dựng một giải pháp thực sự hiệu quả, chúng tôi đã tiến hành phân tích sâu các vấn đề mà các tác nhân đang gặp phải trong mô hình truyền thống:

#### 1.2.1. Mô hình "Môi trường phân mảnh" (The Fragmented Environment)
- **Vấn đề:** Sinh viên thực hành trên các môi trường cục bộ (local) với cấu hình phần cứng và phần mềm khác nhau. Các lỗi như "Version mismatch" hay "Missing dependencies" chiếm đến 30% thời gian lên lớp của giảng viên để hỗ trợ kỹ thuật thay vì tập trung vào tư duy lập trình.
- **Hệ quả:** Làm nản lòng sinh viên mới bắt đầu và tạo ra sự không công bằng trong việc đánh giá kết quả (bài chạy được trên máy sinh viên nhưng không chạy được trên máy giảng viên).

#### 1.2.2. Chu kỳ phản hồi chậm (The Delayed Feedback Loop)
- **Vấn đề:** Trong mô hình truyền thống, sinh viên nộp bài và phải chờ từ vài ngày đến vài tuần để nhận được kết quả chấm điểm từ giảng viên. 
- **Hệ quả:** Khi nhận được phản hồi, sinh viên thường đã quên mất luồng tư duy tại thời điểm viết code, khiến việc sửa lỗi trở nên kém hiệu quả. Một hệ thống lý tưởng cần cung cấp phản hồi trong vòng **dưới 10 giây** ngay khi sinh viên bấm nút Submit.

#### 1.2.3. Thách thức về Đạo văn và Sự bùng nổ của AI
- **Vấn đề:** Với sự hỗ trợ của ChatGPT, GitHub Copilot, việc sinh viên "copy-paste" mã nguồn đã trở nên cực kỳ dễ dàng. Giảng viên gần như không thể kiểm soát được tính trung thực nếu chỉ nhìn vào kết quả cuối cùng.
- **Hệ quả:** Làm giảm sút chất lượng đào tạo và giá trị thực chất của các bằng cấp chuyên môn.

### 1.3. Mục tiêu và Phạm vi của Dự án CodeLearn

#### 1.3.1. Mục tiêu chức năng (Functional Goals)
1.  **Xây dựng Web-IDE chuyên dụng:** Hỗ trợ đa tệp tin, tự động lưu và tích hợp trực tiếp với hệ thống chấm điểm.
2.  **Tự động hóa toàn diện quy trình chấm bài:** Hỗ trợ đa ngôn ngữ (C++, Java, Python, JavaScript) với độ chính xác tuyệt đối.
3.  **Tích hợp trợ lý sư phạm AI:** Sử dụng LLM để chỉ dẫn tư duy thay vì cung cấp lời giải có sẵn.
4.  **Tối ưu hóa quản trị lớp học:** Hệ thống Dashboard phân tích năng lực theo thời gian thực (Real-time Analytics).
5.  **Cơ chế thi đấu và cộng tác:** Tạo ra môi trường học tập xã hội hóa (Social Learning) thông qua Code Battle và Rooms.

#### 1.3.2. Mục tiêu phi chức năng (Non-functional Goals)
- **Tính bảo mật:** Cách ly hoàn toàn mã nguồn thực thi của người dùng khỏi hệ thống chính.
- **Khả năng mở rộng:** Đáp ứng hàng ngàn lượt truy cập đồng thời trong các kỳ thi tập trung.
- **Trải nghiệm người dùng (UX):** Giao diện hiện đại, hỗ trợ chế độ Dark Mode chuyên nghiệp và tương thích tốt trên nhiều thiết bị.

### 1.4. Định vị giải pháp trong hệ sinh thái EdTech

CodeLearn không chỉ là một công cụ Online Judge đơn thuần như LeetCode hay HackerRank. Chúng tôi định vị sản phẩm là một **Hệ quản trị thực hành (Practice Management System - PMS)**. Khác biệt lớn nhất nằm ở:
- **Kiểm soát quy trình:** Giảng viên có thể tham gia vào từng bước làm bài của sinh viên thông qua cơ chế Boilerplate Protection.
- **Tính hàn lâm:** Tích hợp bộ công cụ xuất báo cáo học thuật chuyên nghiệp phục vụ cho việc lưu trữ và kiểm định chất lượng giáo dục.

***
*Kết luận: Chương 1 đã phác thảo một bức tranh toàn cảnh về lý do tại sao CodeLearn cần tồn tại và những mục tiêu cao cả mà dự án hướng tới. Đây là kim chỉ nam cho mọi quyết định thiết kế kiến trúc ở các chương tiếp theo.*
