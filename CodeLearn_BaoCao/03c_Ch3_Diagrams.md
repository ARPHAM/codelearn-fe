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


### 3.4.8. Biểu đồ hoạt động chức năng tạo và chỉnh sửa bài tập
**Hình 3.10. Biểu đồ hoạt động chức năng tạo và chỉnh sửa bài tập**

```plantuml
@startuml AD_CreateProblem
skinparam monochrome true
!theme plain
skinparam backgroundColor #FFFFFF
title Biểu đồ hoạt động: Tạo và chỉnh sửa bài tập (Giảng viên)

|Giảng viên|
start
:Truy cập "Tạo bài tập mới";
:Nhập tiêu đề, mô tả, độ khó, tags;
:Cấu hình workspace (files, template);

if (Dạng bài Fill-in-the-blank?) then (Có)
  :Đánh dấu vùng cho phép chỉnh sửa;
else (Không)
  :Để toàn bộ file là TEMPLATE;
endif

:Thêm Testcase (Input / Expected Output);
:Nhập code giải mẫu (Solution);

|Hệ thống CodeLearn|
:Gửi solution sang Judge0 để xác minh;

if (Tất cả Testcase Pass?) then (Có)
  :Đánh dấu isVerified = true;
  |Giảng viên|
  :Chọn trạng thái PUBLIC hoặc PRIVATE;
  :Nhấn "Xuất bản";
  |Hệ thống CodeLearn|
  :Lưu Problem + ProblemVersion vào DB;
else (Không)
  :Hiển thị Testcase thất bại;
  |Giảng viên|
  :Sửa lại Testcase hoặc Solution;
endif

stop
@enduml
```

### 3.4.9. Biểu đồ hoạt động chức năng kiểm tra đạo văn mã nguồn
**Hình 3.11. Biểu đồ hoạt động chức năng kiểm tra đạo văn mã nguồn**

```plantuml
@startuml AD_Plagiarism
skinparam monochrome true
!theme plain
skinparam backgroundColor #FFFFFF
title Biểu đồ hoạt động: Kiểm tra đạo văn mã nguồn

|Giảng viên|
start
:Chọn bài tập cần kiểm tra;
:Nhấn "Kiểm tra đạo văn";

|Hệ thống CodeLearn|
:Thu thập tất cả bài nộp của bài tập;
:Chuẩn hóa mã nguồn (xóa comment, format);
:Tính toán độ tương đồng cặp đôi (Similarity Score);

if (Score > ngưỡng cảnh báo?) then (Có)
  :Đánh dấu cặp bài nộp nghi ngờ;
  :Tạo báo cáo so sánh chi tiết;
else (Không)
  :Ghi nhận "Không phát hiện đạo văn";
endif

|Giảng viên|
:Xem báo cáo đạo văn;
if (Xác nhận đạo văn?) then (Có)
  :Gắn cờ Flag bài nộp;
  :Áp dụng chính sách điểm số;
else (Không)
  :Bỏ qua cảnh báo;
endif
stop
@enduml
```

---

## 3.5. Biểu đồ tuần tự

### 3.5.1. Biểu đồ tuần tự chức năng đăng ký tài khoản
**Hình 3.12. Biểu đồ tuần tự chức năng đăng ký tài khoản**

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
**Hình 3.13. Biểu đồ tuần tự chức năng đăng nhập hệ thống**

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

### 3.5.3. Biểu đồ tuần tự chức năng chạy thử mã nguồn
**Hình 3.14. Biểu đồ tuần tự chức năng chạy thử mã nguồn**

```plantuml
@startuml SD_RunCode
skinparam monochrome true
!theme plain
title Biểu đồ tuần tự: Chạy thử mã nguồn (Run Code)

actor "Sinh viên" as SV
participant "Frontend" as FE
participant "Run Controller" as RC
participant "Judge0 API" as J0

SV -> FE: Nhấn "Run Code"
FE -> RC: POST /run {code, languageId, stdin}
RC -> J0: POST /submissions?wait=true
J0 --> RC: {stdout, stderr, status}
RC --> FE: {output, status}
FE --> SV: Hiển thị kết quả trong Terminal
@enduml
```

### 3.5.4. Biểu đồ tuần tự chức năng chấm điểm bài nộp
**Hình 3.15. Biểu đồ tuần tự chức năng chấm điểm bài nộp**

```plantuml
@startuml SD_SubmitCode
skinparam monochrome true
!theme plain
title Biểu đồ tuần tự: Nộp bài (Submit)

actor "Sinh viên" as SV
participant "Frontend" as FE
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

### 3.5.5. Biểu đồ tuần tự chức năng nhận gợi ý từ AI Mentor
**Hình 3.16. Biểu đồ tuần tự chức năng nhận gợi ý từ AI Mentor**

```plantuml
@startuml SD_AIMentor
skinparam monochrome true
!theme plain
title Biểu đồ tuần tự: Nhận gợi ý từ AI Mentor

actor "Sinh viên" as SV
participant "Frontend" as FE
participant "AI Controller" as AC
participant "Gemini API" as AI

SV -> FE: Nhấn "Hỏi AI Mentor"
FE -> AC: POST /ai/chat {code, stderr, problemId}
AC -> AC: Xây dựng prompt (system + context)
AC -> AI: generateContent(prompt)
AI --> AC: stream text response
AC --> FE: stream chunks
FE --> SV: Hiển thị gợi ý dần (streaming)
@enduml
```

### 3.5.6. Biểu đồ tuần tự chức năng phòng cộng tác
**Hình 3.17. Biểu đồ tuần tự chức năng phòng cộng tác**

```plantuml
@startuml SD_CollabRoom
skinparam monochrome true
!theme plain
title Biểu đồ tuần tự: Phòng cộng tác (WebSocket)

actor "Sinh viên A" as A
actor "Sinh viên B" as B
participant "Frontend" as FE
participant "Room Gateway" as RG
database "PostgreSQL" as DB

A -> FE: Tạo phòng mới
FE -> RG: WS connect + emit create-room
RG -> DB: INSERT INTO rooms
RG --> A: room-created {roomCode}

B -> FE: Nhập mã phòng, tham gia
FE -> RG: WS connect + emit join-room
RG --> A: user-joined {userId}
RG --> B: room-joined {members}

A -> RG: emit code-change {code, fileId}
RG -> DB: UPDATE workspace
RG --> A: workspace-updated (ACK)

B -> RG: emit watch-user {targetUserId}
RG --> B: workspace-snapshot {code}
@enduml
```

### 3.5.7. Biểu đồ tuần tự chức năng thi đấu Code Battle
**Hình 3.18. Biểu đồ tuần tự chức năng thi đấu Code Battle**

```plantuml
@startuml SD_Battle
skinparam monochrome true
!theme plain
title Biểu đồ tuần tự: Thi đấu Code Battle 1v1

actor "Sinh viên A" as A
actor "Sinh viên B" as B
participant "Battle Gateway" as BG
database "PostgreSQL" as DB

A -> BG: emit find-match
B -> BG: emit find-match
BG -> BG: Matchmaking (Elo-based)
BG -> DB: INSERT INTO battles
BG --> A: match-found {battleId, problem}
BG --> B: match-found {battleId, problem}

A -> BG: emit submit-battle {code}
BG -> DB: UPDATE battles SET winner=A
BG --> A: battle-result {won, ratingDelta}
BG --> B: battle-result {lost, ratingDelta}
@enduml
```

### 3.5.8. Biểu đồ tuần tự chức năng tham gia kỳ thi trực tuyến
**Hình 3.19. Biểu đồ tuần tự chức năng tham gia kỳ thi trực tuyến**

```plantuml
@startuml SD_Exam
skinparam monochrome true
!theme plain
title Biểu đồ tuần tự: Tham gia kỳ thi

actor "Sinh viên" as SV
participant "Frontend" as FE
participant "Exam Controller" as EC
database "PostgreSQL" as DB

SV -> FE: Vào trang kỳ thi
FE -> EC: GET /exam/{examId}
EC -> DB: SELECT exam + problems
EC --> FE: {exam, problems, timeLeft}
FE --> SV: Hiển thị đề thi + đếm ngược

SV -> FE: Nhấn Submit bài thi
FE -> EC: POST /exam/{examId}/submit {answers}
EC -> DB: INSERT INTO exam_submissions
EC --> FE: {score, rank}
@enduml
```

### 3.5.9. Biểu đồ tuần tự chức năng tạo bài tập của giảng viên
**Hình 3.20. Biểu đồ tuần tự chức năng tạo bài tập của giảng viên**

```plantuml
@startuml SD_CreateProblem
skinparam monochrome true
!theme plain
title Biểu đồ tuần tự: Tạo bài tập (Giảng viên)

actor "Giảng viên" as GV
participant "Frontend" as FE
participant "Problem Controller" as PC
participant "Judge0 API" as J0
database "PostgreSQL" as DB

GV -> FE: Điền thông tin bài tập
FE -> PC: POST /problem {title, description, testcases, files}
PC -> DB: INSERT INTO problems + problem_versions
PC -> J0: Verify solution vs testcases
J0 --> PC: all passed
PC -> DB: UPDATE problem_versions SET isVerified=true
PC --> FE: 201 Created {problemId}
@enduml
```

### 3.5.10. Biểu đồ tuần tự chức năng phê duyệt bài tập
**Hình 3.21. Biểu đồ tuần tự chức năng phê duyệt bài tập**

```plantuml
@startuml SD_ApproveProblem
skinparam monochrome true
!theme plain
title Biểu đồ tuần tự: Phê duyệt bài tập (Admin)

actor "Admin" as AD
participant "Frontend" as FE
participant "Problem Controller" as PC
database "PostgreSQL" as DB

AD -> FE: Xem danh sách bài chờ duyệt
FE -> PC: GET /problem/admin/versions/pending
PC -> DB: SELECT pending versions
PC --> FE: [{versionId, title, ...}]

AD -> FE: Nhấn "Phê duyệt"
FE -> PC: PATCH /problem/admin/versions/{id}/approve
PC -> DB: UPDATE problem_versions SET status=APPROVED
PC --> FE: 200 OK
FE --> AD: Thông báo phê duyệt thành công
@enduml
```

### 3.5.11. Biểu đồ tuần tự chức năng xem lộ trình học kỹ năng
**Hình 3.22. Biểu đồ tuần tự chức năng xem lộ trình học kỹ năng**

```plantuml
@startuml SD_LearningPath
skinparam monochrome true
!theme plain
title Biểu đồ tuần tự: Xem lộ trình học Skill Tree

actor "Sinh viên" as SV
participant "Frontend" as FE
participant "Student Controller" as SC
database "PostgreSQL" as DB

SV -> FE: Mở trang Skill Tree
FE -> SC: GET /student/learning-path
SC -> DB: SELECT user_skill_nodes WHERE userId=?
SC --> FE: [{tag, status, progress}]
FE --> SV: Render đồ thị Skill Tree

SV -> FE: Nhấn "Gợi ý thông minh"
FE -> SC: GET /student/learning-path/suggestions
SC -> DB: Phân tích điểm yếu, lọc bài tập
SC --> FE: [{problemId, title, difficulty}]
FE --> SV: Danh sách 5 bài tập gợi ý
@enduml
```

### 3.5.12. Biểu đồ tuần tự chức năng kiểm tra đạo văn mã nguồn
**Hình 3.23. Biểu đồ tuần tự chức năng kiểm tra đạo văn mã nguồn**

```plantuml
@startuml SD_Plagiarism
skinparam monochrome true
!theme plain
title Biểu đồ tuần tự: Kiểm tra đạo văn

actor "Giảng viên" as GV
participant "Frontend" as FE
participant "Plagiarism Controller" as PC
participant "Plagiarism Service" as PS
database "PostgreSQL" as DB

GV -> FE: Nhấn "Kiểm tra đạo văn"
FE -> PC: POST /plagiarism/check/{problemId}
PC -> DB: SELECT all submissions for problem
DB --> PC: submissions data
PC -> PS: checkPlagiarism(submissions)
PS -> PS: So sánh cặp đôi (MOSS/JPlag logic)
PS --> PC: results (similarity scores)
PC -> DB: INSERT INTO plagiarism_results
PC --> FE: {status: "Completed", resultId}
FE --> GV: Hiển thị danh sách các bài trùng lặp
@enduml
```

*(Lưu ý: Toàn bộ 21 biểu đồ trong mục 3.4 và 3.5 bao gồm 9 biểu đồ hoạt động (Hình 3.3–3.11) và 12 biểu đồ tuần tự (Hình 3.12–3.23), đã được đặt tên theo định dạng: Biểu đồ [Loại] chức năng [Tên chức năng].)*
