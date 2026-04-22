# PHẦN 3: PHÂN TÍCH NGHIỆP VỤ VÀ THIẾT KẾ YÊU CẦU

Chương này đi sâu vào việc giải phẫu các luồng nghiệp vụ (Business Logic) nhằm số hóa chính xác các tác vụ giảng dạy tại môi trường đại học vào nền tảng CodeLearn.

## 3.1. Định nghĩa các tác nhân và Kịch bản sử dụng (Use-Case)

Hệ thống được thiết kế dựa trên sự phân tần đặc quyền (Privilege separation) của 3 nhóm tác nhân chính, đảm bảo sự bảo mật và không dẫm chân lên vai trò của nhau:

1. **Sinh viên (Student):** Đối tượng thụ hưởng chính, tham gia các khóa học đã được phân bổ. Tương tác chủ yếu qua Workspace (môi trường gõ mã nội bộ), thực thi bài code, nhận đánh giá tự động và trích xuất báo cáo kết quả hệ thống.
2. **Giảng viên (Lecturer):** Tác nhân xây dựng tri thức. Người trực tiếp tạo định dạng các "bộ xương" bài tập (Boilerplate), thiết lập Test-case và xem thống kê quá trình làm bài của sinh viên trên Analytics Dashboard.
3. **Quản trị viên hệ thống (System Admin):** Cầu nối kỹ thuật. Người giám sát và quản lý trạng thái tài khoản tập trung, đóng vai trò như Phòng Đào tạo để thiết lập kỳ học và khởi tạo tập hồ sơ người dùng.

<!-- [DÁN ẢNH SƠ ĐỒ Ở ĐÂY] 
  (Copy mã code "2. Biểu đồ Use-case Tổng quát" trong file 00_Ma_Nguon_So_Do.md bỏ vào mermaid.live, lưu ảnh và dán vào đây) 
-->

## 3.2. Thiết kế luồng nghiệp vụ cốt lõi (Core Business Flows)

Để giải quyết các "nỗi đau" hệ thống (Pain points) đã nêu ở Phần 1, CodeLearn quy hoạch 2 nhóm luồng xử lý trọng tâm sau:

### Nhóm 1: Tiến trình Đăng ký Sinh viên khép kín (Closed Onboarding System)
Việc cho phép người dùng tự do "Đăng ký" thường dẫn đến lượng lớn dữ liệu ảo. CodeLearn giải quyết bài toán này bằng quy trình Onboarding xác thực định danh 2 chiều.

- **Bước 1:** Quản trị viên (Admin) nhập danh sách sinh viên qua file CSV vào hệ thống. Các tài khoản này được cơ sở dữ liệu ghi nhận ở trạng thái cấu hình chờ (`Pending Users`).
- **Bước 2:** Hệ thống tự động kích hoạt tiến trình nền (Background trigger), sinh ra các Mã bảo mật ngẫu nhiên (Temporary Credentials) và gửi qua hệ thống Email thông báo cho từng sinh viên.
- **Bước 3:** Sinh viên nhận email báo nhập học, bấm vào đường link kích hoạt. Tại đây, luồng Frontend yêu cầu sinh viên điền bổ sung hồ sơ định danh (Ngày sinh - DOB, Trường đại học, SĐT).
- **Bước 4:** Lời gọi API có đính kèm Token này được gửi về hệ thống. Cơ sở dữ liệu thẩm định Token, chuyển trạng thái vòng đời tài khoản thành `Active`, cấp quyền đăng nhập chính thức.

<!-- [DÁN ẢNH SƠ ĐỒ Ở ĐÂY] 
  (Copy mã code "3. Biểu đồ Tuần tự quá trình Onboarding Sinh viên" trong file 00_Ma_Nguon_So_Do.md...) 
-->

### Nhóm 2: Thuật toán quy hoạch bài tập "Điền vào chỗ trống" (Boilerplate Protection Flow)
Đây là quy trình độc quyền của CodeLearn, bảo vệ tính toàn vẹn của mã nguồn mẫu.
- **Bước 1 (Thiết lập):** Giảng viên tạo khung bài tập chuẩn, sau đó thực hiện "khoanh vùng" (Marking chunk) những dòng lệnh cho phép sinh viên tác động.
- **Bước 2 (Kiểm soát môi trường):** Khi sinh viên mở Workspace, hệ thống khóa cứng (Read-only lock) lên toàn bộ các file thư mục gốc. Biến thể UI buộc sinh viên chỉ có thể chèn code vào các khối đã được định nghĩa (`editor boundaries`).
- **Bước 3 (Đồng bộ an toàn):** Trong quá trình Submit bài làm, hệ thống chặn payload cục bộ, không gửi toàn bộ cấu trúc file để chống mã độc. Dữ liệu đoạn code của sinh viên sẽ được dịch ngược về phía Server, sau đó Server tiến hành đối chiếu, trộn vào khung Boilerplate ẩn ở tầng Backend rồi mới chạy trình chấm điểm.

<!-- [DÁN ẢNH SƠ ĐỒ Ở ĐÂY] 
  (Copy mã code "4. Dòng chảy Tạo bài tập Điền vào chỗ trống" trong file 00_Ma_Nguon_So_Do.md...) 
-->

## 3.3. Thiết kế Cấu trúc Cơ sở Dữ liệu Cơ sở (Data Modeling)

Cấu trúc CSDL được hệ thống hóa để tránh dị thường dữ liệu (Data Anomalies) trong quá trình Scale-up hệ thống hàng ngàn sinh viên thao tác cùng lúc, với các thực thể (Entities) cốt lõi bao gồm:

1. **USERS Entity (Người dùng):** Định hình linh hoạt dựa vào trường `Role`. Điểm đặc biệt là dữ liệu hồ sơ được thiết kế độc lập hoặc tùy chọn để hỗ trợ các cập nhật rời rạc (PATCH) mà không ghi đè lẫn nhau.
2. **COURSES & EXERCISES (Học liệu):** Lưu giữ quan hệ 1-N. Bảng `Exercises` lưu trữ các trường JSON đặc tả chứa thông số Boilerplate và thông tin Test-cases.
3. **SUBMISSIONS (Nộp bài):** Đóng vai trò là bảng kết nối, bảo lưu mã nguồn thời điểm hiện tại (`final_code snapshot`) nhằm mục đích tra soát lịch sử của sinh viên nếu có sự vụ nâng hạ điểm hay so sánh chéo. Bảng này cũng ghi nhận điểm số trả về từ Core Engine.
4. **ENROLLMENTS:** Bảng xử lý định hình mảng đa chiều (Many-to-Many) liên kết Môn học quản lý tương ứng với từng nhóm sinh viên.

<!-- [DÁN ẢNH SƠ ĐỒ Ở ĐÂY] 
  (Copy mã code "5. Cấu trúc Database ERD hạt nhân" trong file 00_Ma_Nguon_So_Do.md...) 
-->
