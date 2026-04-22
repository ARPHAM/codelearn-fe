# CHƯƠNG 4. HIỆN THỰC HÓA VÀ ĐÁNH GIÁ

### 4.1. Môi trường triển khai thực tế
Hệ thống "CodeLearn" đã được hiện thực hóa và triển khai thử nghiệm với cấu hình:
- **Server:** Nền tảng Linux hỗ trợ Docker Engine để vận hành các Sandbox chấm bài.
- **Database:** PostgreSQL quản lý hơn 10 bảng thực thể quan hệ, đảm bảo tính nhất quán dữ liệu.
- **Hàng đợi:** Redis kết hợp BullMQ xử lý bất đồng bộ các tác vụ nặng (chấm bài, gửi email, gọi AI).

### 4.2. Kết quả xây dựng các phân hệ chính
Dưới đây là mô tả chi tiết các màn hình chức năng đã hoàn thiện (dành cho phần chụp ảnh minh họa):

#### 4.2.1. Phân hệ IDE trực tuyến và Chấm bài
- **Mô tả:** Giao diện chuyên nghiệp tích hợp Monaco Editor. Người dùng có thể viết mã trực tiếp, chạy thử với Custom Input.
- **Tính năng nổi bật:** Hiển thị kết quả chấm (AC/WA/TLE) theo thời gian thực nhờ kết nối Socket.io, giúp sinh viên không cần load lại trang.

#### 4.2.2. Phân hệ Trợ lý thông minh AI Gemini
- **Mô tả:** Tích hợp panel hỗ trợ bên phải màn hình IDE. 
- **Hoạt động:** Khi người dùng yêu cầu, hệ thống gửi mã nguồn và thông tin lỗi qua Gemini API. AI trả về phân tích: "Bạn đang gặp lỗi tràn mảng ở dòng 15..." thay vì chỉ báo lỗi biên dịch khô khan.

#### 4.2.3. Phân hệ Quản lý và Analytics (Giảng viên)
- **Mô tả:** Dashboard thống kê trực quan.
- **Chức năng:** Giảng viên theo dõi được biểu đồ phân bố điểm số của lớp, danh sách các bài tập "khó" (tỷ lệ AC thấp) để có phương án giảng dạy phù hợp.

#### 4.2.4. Phân hệ Kiểm tra đạo văn
- **Chức năng:** Tự động đối soát mã nguồn của toàn bộ sinh viên trong một kỳ thi/khóa học. Highlight các đoạn mã trùng lặp để giảng viên có bằng chứng xử lý gian lận.

### 4.3. Đánh giá kết quả đạt được
Dựa trên quá trình vận hành thử nghiệm, hệ thống đạt được các chỉ số tích cực:
1. **Tính ổn định:** Kiến trúc Microservices giúp hệ thống vẫn hoạt động bình thường ngay cả khi lõi chấm bài đang quá tải.
2. **Trải nghiệm người dùng:** Giao diện Next.js cho tốc độ phản hồi nhanh, mượt mà trên nhiều thiết bị.
3. **Tính hữu dụng của AI:** Hơn 80% sinh viên tham gia thử nghiệm phản hồi rằng trợ lý AI giúp họ tự sửa được lỗi mà không cần chờ giảng viên.

### 4.4. Hạn chế và Hướng phát triển
- **Hạn chế:** Hệ thống Plagiarism hiện tại tiêu tốn khá nhiều tài nguyên tính toán khi số lượng bài nộp quá lớn (>1000 bài cùng lúc).
- **Hướng phát triển:** Tích hợp thêm các ngôn ngữ lập trình đặc thù khác và nâng cấp mô hình AI để hỗ trợ kiểm thử tự động (Unit Test generation).
