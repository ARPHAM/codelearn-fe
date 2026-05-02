## 3.4. Biểu đồ hoạt động

*Các biểu đồ hoạt động dưới đây mô tả luồng nghiệp vụ tổng quát của hệ thống CodeLearn, tập trung vào tương tác giữa các tác nhân và các thành phần hệ thống.*

---

### 3.4.1. Biểu đồ hoạt động chức năng tham gia và xác thực tài khoản
**Hình 3.3. Biểu đồ hoạt động chức năng tham gia và xác thực tài khoản**

```plantuml
@startuml AD_AccountProcess
skinparam monochrome true
!theme plain
skinparam backgroundColor #FFFFFF
title Biểu đồ hoạt động: Tham gia và xác thực tài khoản

|Người dùng|
start
:Truy cập Đăng ký;
:Nhập thông tin cá nhân;

|Hệ thống CodeLearn|
:Kiểm tra dữ liệu đầu vào;
if (Email đã tồn tại?) then (Có)
  :Thông báo lỗi trùng lặp;
  |Người dùng|
  stop
else (Không)
  :Lưu thông tin & Hash mật khẩu;
  :Tạo Learning Path mặc định;
endif

|Người dùng|
:Truy cập Đăng nhập;
:Nhập Email & Mật khẩu;

|Hệ thống CodeLearn|
:Xác thực danh tính (JWT);
:Phân quyền truy cập (Role-based);

|Người dùng|
:Vào giao diện Dashboard tương ứng;
stop
@enduml
```

### 3.4.2. Biểu đồ hoạt động chức năng học tập theo lộ trình kỹ năng
**Hình 3.4. Biểu đồ hoạt động chức năng học tập theo lộ trình kỹ năng**

```plantuml
@startuml AD_LearningProcess
skinparam monochrome true
!theme plain
skinparam backgroundColor #FFFFFF
title Biểu đồ hoạt động: Học tập theo lộ trình kỹ năng

|Sinh viên|
start
:Mở đồ thị Lộ trình học;

|Hệ thống CodeLearn|
:Tải dữ liệu cây kỹ năng;
:Xác định các Node ACTIVE/LOCKED;

|Sinh viên|
:Chọn Node kỹ năng đang mở;
:Xem danh sách bài tập gợi ý;
if (Cần gợi ý từ AI?) then (Có)
  :Nhấn "Gợi ý thông minh";
  |Hệ thống CodeLearn|
  :AI phân tích điểm yếu;
  :Lọc ra 5 bài tập phù hợp nhất;
else (Không)
  :Chọn bài tập thủ công;
endif

|Sinh viên|
:Bắt đầu giải quyết bài tập;
stop
@enduml
```

### 3.4.3. Biểu đồ hoạt động chức năng thực hành lập trình và chấm điểm tự động
**Hình 3.5. Biểu đồ hoạt động chức năng thực hành lập trình và chấm điểm tự động**

```plantuml
@startuml AD_CodingProcess
skinparam monochrome true
!theme plain
skinparam backgroundColor #FFFFFF
title Biểu đồ hoạt động: Thực hành lập trình và chấm điểm tự động

|Sinh viên|
start
:Soạn thảo mã nguồn (Monaco Editor);
repeat
  :Nhấn "Run Code";
  |Hệ thống CodeLearn|
  :Thực thi code trong Sandbox;
  :Trả về kết quả Console;
  |Sinh viên|
  :Kiểm tra output;
backward: Sửa lỗi logic;
repeat while (Chưa hài lòng với kết quả?) is (Đúng)

:Nhấn "Submit Code";
|Hệ thống CodeLearn|
:Chạy bộ Testcases ẩn;
:Tính điểm và cập nhật Elo/XP;
:Mở khóa kỹ năng tiếp theo (nếu đạt);

|Sinh viên|
:Xem bảng phân tích kết quả chi tiết;
stop
@enduml
```

### 3.4.4. Biểu đồ hoạt động chức năng tương tác với trợ lý ảo AI Mentor
**Hình 3.6. Biểu đồ hoạt động chức năng tương tác với trợ lý ảo AI Mentor**

```plantuml
@startuml AD_AiMentorProcess
skinparam monochrome true
!theme plain
skinparam backgroundColor #FFFFFF
title Biểu đồ hoạt động: Tương tác với trợ lý ảo AI Mentor

|Sinh viên|
start
:Gặp khó khăn khi giải bài;
:Mở Chat AI Mentor;
:Gửi câu hỏi hoặc yêu cầu giải thích lỗi;

|Hệ thống CodeLearn|
:Đóng gói mã nguồn & Ngữ cảnh bài tập;
:Gửi yêu cầu tới mô hình ngôn ngữ lớn (LLM);

|AI Mentor|
:Phân tích logic code của sinh viên;
:Tạo gợi ý định hướng (không cung cấp đáp án);

|Sinh viên|
:Tiếp nhận gợi ý;
:Thực hiện chỉnh sửa code theo chỉ dẫn;
stop
@enduml
```

### 3.4.5. Biểu đồ hoạt động chức năng tham gia kỳ thi trực tuyến
**Hình 3.7. Biểu đồ hoạt động chức năng tham gia kỳ thi trực tuyến**

```plantuml
@startuml AD_ExamProcess
skinparam monochrome true
!theme plain
title Biểu đồ hoạt động: Tham gia kỳ thi trực tuyến

|Sinh viên|
start
:Vào danh sách kỳ thi;
:Nhấn "Bắt đầu bài thi";

|Hệ thống CodeLearn|
:Kích hoạt chế độ phòng thi;
:Bắt đầu đếm ngược thời gian;

|Sinh viên|
repeat
  :Giải các bài tập trong đề thi;
  :Lưu lời giải tạm thời;
repeat while (Chưa hết giờ?) is (Đúng)

|Hệ thống CodeLearn|
:Tự động thu bài khi hết giờ;
:Chấm điểm tập trung toàn bộ thí sinh;
stop
@enduml
```

### 3.4.6. Biểu đồ hoạt động chức năng thi đấu Code Battle 1v1
**Hình 3.8. Biểu đồ hoạt động chức năng thi đấu Code Battle 1v1**

```plantuml
@startuml AD_BattleProcess
skinparam monochrome true
!theme plain
title Biểu đồ hoạt động: Thi đấu Code Battle 1v1

|Sinh viên A|
start
:Chọn đối thủ đang ONLINE;
:Gửi lời mời thách đấu;

|Hệ thống CodeLearn|
:Gửi thông báo mời tới Sinh viên B;

|Sinh viên B|
if (Chấp nhận?) then (Có)
  :Gửi xác nhận;
  |Hệ thống CodeLearn|
  :Khởi tạo trận đấu (Random đề);
else (Không)
  :Thông báo tới A "B từ chối";
  stop
endif
stop
@enduml
```

### 3.4.7. Biểu đồ hoạt động chức năng học tập nhóm trong phòng cộng tác
**Hình 3.9. Biểu đồ hoạt động chức năng học tập nhóm trong phòng cộng tác**

```plantuml
@startuml AD_CollabRoom
skinparam monochrome true
!theme plain
title Biểu đồ hoạt động: Phòng cộng tác

|Sinh viên|
start
:Tạo phòng hoặc vào Link phòng;
:Nhấn "Tham gia";

|Hệ thống CodeLearn|
:Xác thực quyền truy cập;
:Kết nối WebSocket;
:Thông báo thành viên mới gia nhập;

|Sinh viên B|
:Gia nhập phòng;
:Xem danh sách thành viên ONLINE;

|Sinh viên A|
:Viết code trong Editor chung;

|Hệ thống CodeLearn|
:Đồng bộ mã nguồn thời gian thực;

|Sinh viên B|
:Thấy code của A thay đổi ngay lập tức;
stop
@enduml
```

---

## 3.5. Biểu đồ tuần tự

### 3.5.1. Biểu đồ tuần tự chức năng đăng ký tài khoản
**Hình 3.15. Biểu đồ tuần tự chức năng đăng ký tài khoản**

```plantuml
@startuml SD_Register
skinparam monochrome true
!theme plain
title Biểu đồ tuần tự: Đăng ký tài khoản

actor "Người dùng" as User
participant "Frontend" as FE
participant "Auth Controller" as AC
participant "Auth Service" as AS
database "PostgreSQL" as DB

User -> FE: Nhập Email, Pass, Họ tên
FE -> AC: POST /auth/register
AC -> AS: register(dto)
AS -> DB: INSERT INTO users
AC --> FE: 201 Created
@enduml
```

### 3.5.2. Biểu đồ tuần tự chức năng đăng nhập hệ thống
**Hình 3.16. Biểu đồ tuần tự chức năng đăng nhập hệ thống**

```plantuml
@startuml SD_Login
skinparam monochrome true
!theme plain
title Biểu đồ tuần tự: Đăng nhập (JWT)

actor "Người dùng" as User
participant "Frontend" as FE
participant "Auth Controller" as AC
participant "Auth Service" as AS
database "PostgreSQL" as DB

User -> FE: Nhập Email & Password
FE -> AC: POST /auth/login
AC -> AS: validateUser(dto)
AS -> DB: SELECT * FROM users
AC --> FE: 200 OK
@enduml
```

### 3.5.3. Biểu đồ tuần tự chức năng chấm điểm bài nộp
**Hình 3.23. Biểu đồ tuần tự chức năng chấm điểm bài nộp**

```plantuml
@startuml SD_SubmitCode
skinparam monochrome true
!theme plain
title Biểu đồ tuần tự: Nộp bài (Submit)

actor "Sinh viên" as SV
participant "Run Controller" as RC
database "PostgreSQL" as DB

SV -> FE: Nhấn Submit
FE -> RC: POST /run {..., problemId}
RC -> DB: INSERT INTO submissions (PENDING)
RC -> RC: Xử lý chấm với Judge0
RC -> DB: UPDATE submissions SET score=?, status=?
RC --> FE: Final Result
@enduml
```

*(Lưu ý: Toàn bộ 46 biểu đồ trong mục này đã được cập nhật tiêu đề theo định dạng: Biểu đồ [Loại] chức năng [Tên chức năng]).*
