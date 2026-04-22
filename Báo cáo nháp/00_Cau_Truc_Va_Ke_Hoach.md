# BỐ CỤC BÁO CÁO CẢI TIẾN & KẾ HOẠCH NÂNG CẤP DỰ ÁN CODELEARN
*Mục tiêu: Thiết kế bố cục tối ưu để giảm tỷ lệ đạo văn, đồng thời phản ánh chân thực vòng đời và khối lượng công việc kỹ thuật của dự án CodeLearn.*

---

## PHẦN 1: BỐI CẢNH & ĐẶT VẤN ĐỀ (Thay cho "Mở đầu")
> Thay vì viết các lý do chung chung, hãy xoáy sâu vào các xu hướng EdTech và nỗi đau (pain points) thực tế của giảng viên và sinh viên.

**1.1. Thực trạng giáo dục và thực hành lập trình hiện nay**
- Đánh giá sự chuyển dịch sang học tập trực tuyến.
- Những hạn chế phương pháp kiểm tra lập trình truyền thống.

**1.2. Phân tích "Nỗi đau" (Pain points) của hệ thống hiện tại**
- Giảng viên khó thiết kế các bài tập đa dạng, đặc biệt là dạng "Điền vào chỗ trống" (Fill-in-the-blank) một cách bảo mật.
- Thiếu các luồng Onboarding quy chuẩn cho sinh viên (tài khoản chờ, email kích hoạt).
- Cồng kềnh trong việc trích xuất và biến đổi định dạng tài liệu phục vụ báo cáo (Markdown sang PDF/Word).

**1.3. Mục tiêu giải pháp và Định vị sản phẩm CodeLearn**
- Định vị CodeLearn thành một nền tảng thực hành tích hợp công cụ đánh giá chuyên sâu.
- Phạm vi dự án.

---

## PHẦN 2: THIẾT KẾ KIẾN TRÚC & QUYẾT ĐỊNH CÔNG NGHỆ 
> Đừng sao chép khái niệm lý thuyết. Hãy trình bày theo cấu trúc: Công nghệ X, tại sao chọn X cho bài toán này.

**2.1. Tiêu chí và phân tích lựa chọn công nghệ**
- Đánh giá hiệu suất, bảo mật và khả năng mở rộng.

**2.2. Thiết kế Kiến trúc Hệ thống Tổng thể**
- Phân tách Frontend (Next.js) và Backend.
<!-- [DÁN SƠ ĐỒ Ở ĐÂY]: Dán hình ảnh System Architecture từ file mã sơ đồ riêng -->

**2.3. Giải pháp Xử lý Dữ liệu và Bảo mật**
- Cơ chế bảo mật và phân quyền vai trò.
- Quản lý trạng thái và Theme Provider (cách giới hạn lỗi Hydration).

**2.4 Tích hợp thư viện chuyên biệt (Core Engine)**
- Xử lý quá trình biên dịch văn bản cấu trúc với Pandoc & PrinceXML.
- Xây dựng Code Editor phiên bản đặc tả cho sinh viên.

---

## PHẦN 3: PHÂN TÍCH NGHIỆP VỤ & THIẾT KẾ YÊU CẦU

**3.1. Phân tích luồng tương tác người dùng (Use-cases)**
<!-- [DÁN SƠ ĐỒ Ở ĐÂY]: Dán hình ảnh Use-case tổng quát từ file mã sơ đồ riêng -->

**3.2. Thiết kế luồng nghiệp vụ cốt lõi (Business Flows)**
- **Nhóm 1:** Quy trình quy hoạch và đăng ký sinh viên mới (Onboarding System).
<!-- [DÁN SƠ ĐỒ Ở ĐÂY]: Dán biểu đồ Sinh viên Onboarding từ file mã sơ đồ riêng -->
- **Nhóm 2:** Luồng xử lý bài tập "Điền vào chỗ trống" (Template protection / Code integration).
<!-- [DÁN SƠ ĐỒ Ở ĐÂY]: Dán biểu đồ Dòng chảy hệ thống bài tập từ file mã sơ đồ riêng -->

**3.3. Thiết kế Cấu trúc Hệ trị cơ sở dữ liệu**
- Cấu trúc bảng hạt nhân (User Profiles, Courses, Roles).
<!-- [DÁN SƠ ĐỒ Ở ĐÂY]: Dán hình ảnh Cấu trúc Schema DB (ERD) từ file mã sơ đồ riêng -->

---

## PHẦN 4: HIỆN THỰC HÓA VÀ GIAO DIỆN NGƯỜI DÙNG

**4.1. Không gian học tập của Sinh viên (Student Workspace)**
- Hiện thực API phục vụ Code Editor và cơ chế ngăn chặn can thiệp thư mục gốc.
<!-- [DÁN GIAO DIỆN Ở ĐÂY]: Chụp màn hình Student Workspace UI (Code Editor) -->

**4.2. Bảng phân tích Giảng viên (Lecturer Analytics Dashboard)**
- Quản lý học liệu, giám sát tiến độ làm bài.
<!-- [DÁN GIAO DIỆN Ở ĐÂY]: Chụp màn hình Lecturer Dashboard UI -->

**4.3. Cổng Quản trị viên (Admin Portal)**
- Giao diện Admin quản lý người dùng với dữ liệu phức hợp (Đại học, SĐT, Khoá học).
<!-- [DÁN GIAO DIỆN Ở ĐÂY]: Chụp màn hình Admin Interface -->

**4.4. Giải quyết các thách thức kỹ thuật dự án (PHẦN QUAN TRỌNG KÉO DÀI BÁO CÁO)**
> Viết tài liệu kỹ thuật cá nhân để tránh 100% đạo văn
- Vấn đề 1: Giải quyết xung đột trạng thái và lỗi chớp tắt màn hình do Theme Provider.
- Vấn đề 2: Ngăn chặn sinh viên xoá/đổi tên các file template gốc trong không gian biên dịch.
- Vấn đề 3: Đảm bảo format chuẩn cho định dạng PDF khi xuất qua PrinceXML gặp lỗi fonts/cấu trúc.

---

## PHẦN 5: ĐÁNH GIÁ & KẾ HOẠCH NÂNG CẤP TƯƠNG LAI

**5.1. Kết quả đạt được**
- Đánh giá trên phương diện hiệu năng và giao diện UI/UX.

**5.2. Lộ trình nâng cấp và mở rộng (Upgrade Plan)**
- **Giai đoạn 1 (Ngắn hạn - Mở rộng ngay):** 
  - Tích hợp bộ phân tích hành vi học tập của sinh viên dựa trên AI (Phân tích mã nguồn và đưa ra mẹo tối ưu Code tự động).
  - Hoàn thiện hệ thống bảo mật chống thay đổi request từ client trong quá trình nộp bài "Điền vào chỗ trống".
- **Giai đoạn 2 (Trung hạn):**
  - Mở rộng hỗ trợ tính năng làm việc nhóm song song (Real-time Collaboration Workspace) tương tự như Google Docs nhưng dành cho IDE.
  - Tích hợp hệ thống phân tích mã tĩnh (Static Code Analysis Tool) chạy ngầm như SonarQube để chấm điểm Clean Code cho sinh viên.
- **Giai đoạn 3 (Dài hạn):**
  - Đóng gói hệ thống dưới dạng nền tảng SaaS Multi-tenant, cho phép nhiều trường Đại học cùng mua bản quyền sử dụng độc lập.
  - Chuyển cấu trúc biên dịch (Pandoc/PDF) sang Microservices tự co giãn thay vì xử lý nguyên khối trên 1 server bảo vệ tài nguyên chính.

**5.3. Kết luận**

---

## 📌 PHƯƠNG PHÁP "KÉO DÀI NỘI DUNG" (TĂNG ĐỘ DÀY BÁO CÁO)
- **Phương pháp 1:** Thay vì chỉ nói "Ứng dụng có chức năng quản lý người dùng", hãy diễn giải: `Nhu cầu thực tế -> Góc nhìn kỹ thuật -> Phân bổ Payload dữ liệu JSON -> Cấu trúc API endpoint RESTful -> Kết quả giao diện`. Đi sâu vào kỹ thuật giúp nội dung rất dài và chuẩn khoa học.
- **Phương pháp 2:** Đưa mã JSON/Code snippets vào báo cáo. Mã nguồn đặc thù của bạn và không thể bị phần mềm Check đạo văn (Turnitin/DoIT) phát hiện bắt lỗi.
- **Phương pháp 3:** Thêm mục "Lịch sử tối ưu hiệu năng". Trình bày lại quá trình fix các bugs điển hình trong quá trình làm (VD: Sửa lỗi Import thiếu trên Nutrition page, fix màn hình blank Editor).
