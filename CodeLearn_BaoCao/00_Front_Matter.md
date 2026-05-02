# LỜI CAM ĐOAN

Tôi tên là: **[Họ và tên của bạn]**
Sinh viên lớp: **[Tên lớp]** – Khoa: **[Tên khoa]** – Trường: **[Tên trường]**

Tôi xin cam đoan đề tài: **"Xây dựng nền tảng học tập lập trình trực tuyến CodeLearn tích hợp trợ lý ảo AI và hệ thống chấm bài tự động"** là công trình nghiên cứu của riêng tôi dưới sự hướng dẫn của **[Họ tên GVHD]**.

Các số liệu, kết quả nêu trong đồ án là trung thực và chưa từng được công bố trong bất kỳ công trình nào khác. Toàn bộ các tham khảo từ các nguồn tài liệu khác đều được trích dẫn nguồn gốc rõ ràng theo đúng quy định.

Tôi xin hoàn toàn chịu trách nhiệm trước Nhà trường và pháp luật về lời cam đoan này.

*Hà Nội, ngày ... tháng ... năm 2024*

**Người cam đoan**

*(Ký và ghi rõ họ tên)*

---

# LỜI CẢM ƠN

Lời đầu tiên, em xin gửi lời cảm ơn chân thành và sâu sắc nhất tới thầy/cô **[Họ tên GVHD]**, người đã tận tình hướng dẫn, chỉ bảo và truyền đạt cho em những kiến thức, kinh nghiệm quý báu trong suốt quá trình thực hiện đồ án tốt nghiệp này. Sự định hướng và khích lệ của thầy/cô là động lực lớn lao giúp em vượt qua những khó khăn về mặt kỹ thuật để hoàn thiện sản phẩm.

Em cũng xin gửi lời cảm ơn tới các thầy, cô giáo trong khoa **[Tên khoa]** – trường **[Tên trường]** đã dạy dỗ và trang bị cho em những kiến thức nền tảng vững chắc trong suốt những năm học vừa qua.

Cuối cùng, con xin gửi lời cảm ơn tới gia đình và bạn bè đã luôn ở bên cạnh ủng hộ, động viên và tạo mọi điều kiện tốt nhất để con/mình có thể tập trung hoàn thành tốt đề tài nghiên cứu này.

Mặc dù đã có nhiều cố gắng, nhưng do hạn chế về thời gian và kinh nghiệm thực tế nên đồ án không tránh khỏi những thiếu sót. Em rất mong nhận được sự chỉ bảo, đóng góp ý kiến của các thầy cô giáo để đề tài của em được hoàn thiện hơn.

*Em xin chân thành cảm ơn!*

---

# DANH MỤC CÁC TỪ VIẾT TẮT

| Viết tắt | Tiếng Anh | Tiếng Việt |
| :--- | :--- | :--- |
| **AI** | Artificial Intelligence | Trí tuệ nhân tạo |
| **API** | Application Programming Interface | Giao diện lập trình ứng dụng |
| **DBMS** | Database Management System | Hệ quản trị cơ sở dữ liệu |
| **ERD** | Entity Relationship Diagram | Sơ đồ thực thể liên kết |
| **IDE** | Integrated Development Environment | Môi trường phát triển tích hợp |
| **JSON** | JavaScript Object Notation | Định dạng hoán đổi dữ liệu nhẹ |
| **LLM** | Large Language Model | Mô hình ngôn ngữ lớn |
| **ORM** | Object-Relational Mapping | Ánh xạ đối tượng - quan hệ |
| **RAG** | Retrieval-Augmented Generation | Tạo truy xuất tăng cường |
| **RBAC** | Role-Based Access Control | Kiểm soát truy cập dựa trên vai trò |
| **SPA** | Single Page Application | Ứng dụng đơn trang |
| **SSR** | Server Side Rendering | Kết xuất phía máy chủ |
| **UML** | Unified Modeling Language | Ngôn ngữ mô hình hóa thống nhất |

---

# DANH MỤC BẢNG

*   Bảng 2.1. Sự tiến hóa của các thế hệ Online Judge
*   Bảng 3.1. Các tác nhân chính tham gia hệ thống
*   Bảng 3.2. Đặc tả thực thể Người dùng (USER)
*   Bảng 3.3. Đặc tả thực thể Nút kỹ năng (USER_SKILL_NODE)
*   Bảng 3.4. Đặc tả thực thể Bài toán (PROBLEM)
*   Bảng 3.5. Đặc tả thực thể Phiên bản bài tập (PROBLEM_VERSION)
*   Bảng 3.6. Đặc tả thực thể Tệp tin mã nguồn mẫu (PROBLEM_FILE)
*   Bảng 3.7. Đặc tả thực thể Bộ kiểm thử (TESTCASE)
*   Bảng 3.8. Đặc tả thực thể Lượt nộp bài (SUBMISSION)
*   Bảng 3.9. Đặc tả thực thể Kỳ thi tập trung (EXAM)
*   Bảng 3.10. Đặc tả thực thể Nhật ký giám thi số (EXAM_LOG)
*   Bảng 3.11. Đặc tả thực thể Trận đấu đối kháng (BATTLE_SESSION)
*   Bảng 3.12. Đặc tả thực thể Phòng học nhóm (ROOM)
*   Bảng 3.13. Đặc tả các API hạt nhân của hệ thống

---

# DANH MỤC HÌNH ẢNH

*   Hình 3.1. Sơ đồ kiến trúc tổng thể hệ thống (Multi-tier)
*   Hình 3.2. Sơ đồ Use Case tổng thể hệ thống CodeLearn
*   Hình 3.3. Biểu đồ hoạt động: Tham gia và xác thực tài khoản
*   Hình 3.4. Biểu đồ hoạt động: Học tập theo lộ trình kỹ năng
*   Hình 3.5. Biểu đồ hoạt động: Thực hành lập trình và chấm điểm
*   Hình 3.6. Biểu đồ hoạt động: Tương tác với AI Mentor
*   Hình 3.7. Biểu đồ hoạt động: Tham gia kỳ thi trực tuyến
*   Hình 3.8. Biểu đồ hoạt động: Thi đấu Code Battle 1v1
*   Hình 3.9. Biểu đồ hoạt động: Học tập nhóm phòng cộng tác
*   Hình 3.10. Biểu đồ hoạt động: Tạo và chỉnh sửa bài tập
*   Hình 3.11. Biểu đồ hoạt động: Kiểm tra đạo văn mã nguồn
*   Hình 3.12. Biểu đồ tuần tự: Đăng ký tài khoản sinh viên
*   Hình 3.13. Biểu đồ tuần tự: Đăng nhập hệ thống
*   Hình 3.14. Biểu đồ tuần tự: Thực thi mã nguồn (Run Code)
*   Hình 3.15. Biểu đồ tuần tự: Chấm điểm bài nộp (Submit Code)
*   Hình 3.16. Biểu đồ tuần tự: Nhận gợi ý từ AI Mentor
*   Hình 3.17. Biểu đồ tuần tự: Tương tác phòng cộng tác WebSocket
*   Hình 3.18. Biểu đồ tuần tự: Quy trình thi đấu Code Battle
*   Hình 3.19. Biểu đồ tuần tự: Tham gia kỳ thi trực tuyến
*   Hình 3.20. Biểu đồ tuần tự: Tạo bài tập mới (Giảng viên)
*   Hình 3.21. Biểu đồ tuần tự: Phê duyệt bài tập (Admin)
*   Hình 3.22. Biểu đồ tuần tự: Xem lộ trình học Skill Tree
*   Hình 3.23. Biểu đồ tuần tự: Kiểm tra đạo văn mã nguồn
*   Hình 3.24. Biểu đồ lớp: Phân hệ Người dùng & Lộ trình học
*   Hình 3.25. Biểu đồ lớp: Phân hệ Bài tập & Quản lý phiên bản
*   Hình 3.26. Biểu đồ lớp: Phân hệ Nộp bài & Kết quả chấm
*   Hình 3.27. Biểu đồ lớp: Tổng thể hệ thống CodeLearn
*   Hình 3.28. Sơ đồ thực thể liên kết (ERD) - Database Schema
*   Hình 3.29. Biểu đồ trạng thái: Vòng đời bài nộp (Submission)
*   Hình 3.30. Biểu đồ trạng thái: Vòng đời bài tập (Problem)
*   Hình 3.31. Biểu đồ trạng thái: Vòng đời trận đấu (Battle)
*   Hình 3.32. Biểu đồ trạng thái: Vòng đời kỳ thi (Exam)
*   Hình 3.33. Biểu đồ triển khai hệ thống (Deployment Diagram)
*   Hình 4.1. Giao diện Workspace tích hợp IDE, Terminal và AI Mentor
*   Hình 4.2. Giao diện thi đấu đối kháng 1v1 thời gian thực
*   Hình 4.3. Cây kỹ năng (Skill Tree) cá nhân hóa cho sinh viên
*   Hình 4.4. Dashboard thống kê hiệu suất và phân tích lỗi
*   Hình 4.5. Workbench giám sát bài nộp trực tuyến cho giảng viên
