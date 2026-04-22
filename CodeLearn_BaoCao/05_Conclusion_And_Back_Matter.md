# PHẦN 5: ĐÁNH GIÁ TỔNG KẾT VÀ LỘ TRÌNH PHÁT TRIỂN (UPGRADE PLAN)

### 5.1. Đánh giá Khái quát về Kết quả Đạt được (Outcome Evaluation)

Tính đến thời điểm hiện tại của khóa luận, dự án CodeLearn đã cơ bản hoàn thiện việc lắp ráp các mảnh ghép cốt lõi trong kiến trúc tổng thể, đáp ứng được các chỉ tiêu thiết kế chuyên môn đã đề ra ở Giai đoạn Phân tích Hệ thống. Những thành tựu kỹ thuật và nghiệp vụ chủ chốt đạt được bao gồm:

1. **Về tính năng Nghiệp vụ và Quản lý người dùng:** Số hóa thành công toàn bộ chu trình khởi tạo học liệu và vòng đời thực hành trên Cloud IDE (Môi trường phát triển tích hợp trên đám mây). Luồng phân quyền khép kín (Khởi tạo Upload CSV -> Gửi Token Kích hoạt qua Email -> Xác thực Form) đã giải quyết triệt để vấn đề rác dữ liệu ảo ở cấp Quản trị viên, đảm bảo môi trường định danh chuẩn mực cho giáo dục.
2. **Về năng lực Hệ thống và Bảo mật Bài tập:** Hệ thống đảm nhiệm tốt việc quản lý không gian làm việc (Student Workspace) cách ly cho từng sinh viên. Đặc biệt, nó đã thiết lập thành công rào chắn bảo vệ nghiêm ngặt khuôn mẫu Boilerplate chuẩn (phép toán Fill-in-the-blank), chặn đứng các hành vi tẩy xóa cấu trúc thư mục từ giao diện Frontend và sử dụng Payload cục bộ để hòa trộn mã an toàn tại Backend trước khi đưa vào luồng biên dịch.
3. **Về cấu trúc Vận hành Core Engine:** Hệ thống Dịch tài liệu đa tầng (Document Engine) với sự kết hợp của `Pandoc` (xử lý Markdown) và `PrinceXML` (dàn trang in ấn PDF) đã được tích hợp trơn tru. Điều này giúp tự động hóa quá trình sinh báo cáo văn bản mang chuẩn học thuật, bảo trì chính xác từng phông chữ tiếng Việt có dấu (`UTF-8`) và định dạng Table CSS phức tạp mà không tiêu xài tài nguyên Rendering ở máy Client.
4. **Về Chỉ số Hiệu năng:** Thông qua việc Audit mã định kỳ, thời gian Render Code (Build Time) và các vòng lặp ẩn như Hydration Mismatch ở cấu trúc giao diện Node.js đã được kiểm soát về ngưỡng an toàn. Tài nguyên máy chủ giảm thiểu độ tiêu tốn RAM đáng kể, đảm bảo tính bền bỉ khi uptime liên tục.

### 5.2. Kế hoạch Phát triển và Nâng cấp Vòng đời Sản phẩm (Roadmap / Upgrade Plan)

Dựa trên tầm nhìn dài hạn nhằm đưa hệ thống vượt ra hoàn toàn khỏi tính chất của một ứng dụng đồ án thông thường để hướng tới một chuẩn công nghiệp phân phối thương mại quốc tế (B2B EdTech), nhóm nghiên cứu mạnh dạn đề xuất Lộ trình phát triển hệ thống qua 3 giai đoạn:

**Giai đoạn 1 (Nâng cấp Cốt lõi Vĩ mô và Bảo mật - Khung thời gian 3 đến 6 tháng tới):**
- **Trợ lý AI phân tích Cây cú pháp trừu tượng (AST - Abstract Syntax Tree Analysis):** Kế hoạch hiện tại dự định nâng cấp AI không chỉ dừng lại ở phân tích Test-cases hỏng dạng chuỗi. Hệ thống sẽ sử dụng AI chạy ngầm thuật toán AST, phân tích kiến trúc lồng của các hàm do sinh viên viết để đưa ra cấu trúc tối ưu độ phức tạp Thời gian - Không gian (Big-O Time/Space Complexity) một cách trúng đích mà không lộ lời giải gốc.
- **Tăng cường cơ chế Anti-Tampering (Chống giả mạo tầng Transport):** Bổ sung chữ ký mã hóa (HMAC Cryptography) cho các Request nộp submit bài từ Frontend. Chữ ký này được băm cùng chuỗi bảo mật JWT, nhằm đẩy lùi 100% rủi ro sinh viên sử dụng công cụ Postman hay cURL để thay đổi Payload, giả mạo kết quả trả về qua mặt hệ thống biên dịch Sandbox.

**Giai đoạn 2 (Gia tăng Tính năng Cộng tác & Đo lường Chất lượng - Khung thời gian 6 đến 12 tháng tới):**
- **Không gian mã cộng tác đồng thời (Real-time Collaboration Workspace):** Nâng cấp Web-IDE sử dụng kiến trúc WebSocket mạnh mẽ và kỹ thuật chuỗi Đồng thuận tĩnh (như CRDTs) để tạo chức năng tương tự Google Docs. Qua đó, giảng viên trong giờ thực hành có thể "nhảy thẳng" vào phiên làm việc ảo của một nhóm sinh viên, xem quá trình thảo luận và gõ code trực tiếp để định hướng kiến thức (Mô hình Pair-programming On-Cloud).
- **Kiểm định mã tĩnh (Static Code Analyzer integration):** Tích hợp dịch vụ phân tích mã tĩnh như SonarQube vào đường ống nộp bài. Lúc này, CodeLearn không chỉ chấm điểm qua ranh giới đúng/sai Input/Output, mà còn quét và đánh giá cách đặt tên biến, phát hiện code nghẽn, code thừa (Dead code) và cung cấp thang điểm Clean Code Rating.

**Giai đoạn 3 (Quy mô Kiến trúc Lớn và Thương mại hóa - Khung thời gian 1 đến 2 năm tới):**
- **Dịch chuyển chuẩn Microservices và Serverless:** Đẩy các luồng xử lý "đốt cháy CPU" và có tính chất gián đoạn như: Chuyển đổi định dạng báo cáo (PrinceXML Engine) hoặc Container Docker biên dịch Code ra khỏi Server chính (Monolith Backend). Các logic này sẽ nằm trong các dịch vụ hàm phi máy chủ (Serverless Functions như AWS Lambda). Bước đi này giải phóng toàn bộ băng thông hệ thống cốt lõi và cho phép tự co giãn vô hạn (Infinite Auto-scale) linh hoạt trong những mùa thi cao điểm.
- **Kiến trúc Multi-tenant SaaS (Software as a Service):** Đóng gói tổng hợp toàn bộ giải pháp CodeLearn thành mô hình dịch vụ cấp phép (License). Hỗ trợ kiến trúc phân tách lược đồ Database (Schema separation), mở cánh cửa cho phép hàng trăm cơ sở Đại học, viện Đào tạo tư nhân cùng có thể mua bản quyền sử dụng trên Cụm máy chủ của CodeLearn mà dữ liệu vẫn được cách ly độc lập tuyệt đối.

### 5.3. Kết luận Toàn khóa luận

Trải qua các chặng đường phát triển với lượng lớn các bài toán thử thách kỹ thuật chuyên sâu, nền tảng hệ thống CodeLearn đã chứng minh được tính hiệu quả, tính thực tiễn và tính khả thi trong việc dung hòa sự cứng nhắc của các ngôn ngữ lập trình thiết bị với tư duy sư phạm mềm dẻo. Bằng hướng tiếp cận thiết kế kiến trúc lấy trọng tâm là phân tách tiến trình bảo mật (Micro-isolation), và làm giàu mô hình giáo dục thông qua các Core Engine chuyên dụng, dự án đã bứt phá khỏi thiết kế của các hệ thống nộp lý thuyết lẻ tẻ để hình thành một Không gian đào tạo tương tác vẹn toàn. 

Với tài liệu thiết kế nghiệp vụ chuẩn xác cùng lộ trình nâng cấp (Upgrade Plan) đã được quy hoạch bài bản đến từng chi tiết, dự án CodeLearn mang trong mình một tiềm năng to lớn, hứa hẹn sẽ đưa vào ứng dụng thực tiễn đóng góp hiệu quả vào chương trình nâng cao chất lượng và chuyển đổi số ở môi trường đại học công nghệ trong tương lai.
