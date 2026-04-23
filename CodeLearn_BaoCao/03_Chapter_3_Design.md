# CHƯƠNG 3. PHÂN TÍCH NGHIỆP VỤ VÀ THIẾT KẾ YÊU CẦU HỆ THỐNG

Chương này đi sâu vào việc giải phẫu các luồng nghiệp vụ (Business Logic) nhằm số hóa chính xác các tác vụ giảng dạy tại môi trường đại học vào nền tảng CodeLearn. Yêu cầu đặt ra không chỉ là một ứng dụng web CRUD (Create, Read, Update, Delete) thông thường, mà là một hệ thống xử lý logic rẽ nhánh, bảo vệ tính toàn vẹn trạng thái và phân quyền một cách cực kỳ sát sao đối với từng đối tượng sử dụng.

### 3.1. Định nghĩa các tác nhân và Kịch bản sử dụng hệ thống (Use-Case Analysis)

Hệ thống được thiết kế hoàn toàn dựa trên sự phân tần đặc quyền (Privilege separation) của 3 nhóm tác nhân (Actors) cốt lõi, đảm bảo sự bảo mật và không dẫm chân lên vai trò của nhau:

1. **Sinh viên (Student):**
    - *Đặc điểm:* Là đối tượng thụ hưởng chính, tham gia vào các khóa học đã được phân bổ định danh. 
    - *Nhiệm vụ trên hệ thống:* Sinh viên tương tác chủ yếu qua Workspace (môi trường gõ mã nội bộ). Họ thực thi bài code, nhận đánh giá tự động tức thời từ hệ thống (Passed/Failed), tra cứu lịch sử nộp bài (Submission History), đọc giải thích từ Trợ lý ảo Gemini AI, và tự tiến hành trích xuất báo cáo kết quả đánh giá (Export Report tới định dạng PDF).
2. **Giảng viên (Lecturer / Instructor):**
    - *Đặc điểm:* Là tác nhân xây dựng tri thức và điều phối lớp học. 
    - *Nhiệm vụ trên hệ thống:* Người trực tiếp tạo mới các khóa học (Courses), thiết lập thành phần "bộ xương" bài tập (Boilerplate) cho cấu trúc "Điền vào chỗ trống". Giảng viên quản lý các bài toán (Problems), cấu hình dữ liệu đầu vào chuẩn (Test-case inputs), và giám sát theo thời gian thực (Real-time Analytics) quá trình làm bài của sinh viên trên Dashboard thông minh để kịp thời điều chỉnh giáo án. Bên cạnh đó, thao tác quét kiểm tra Đạo văn (Plagiarism Check) cũng thuộc thẩm quyền nhóm này.
3. **Quản trị viên hệ thống (System Administrator):**
    - *Đặc điểm:* Là kỹ sư phần mềm hoặc chuyên viên Phòng Đào tạo, đóng vai trò Cầu nối kỹ thuật. 
    - *Nhiệm vụ trên hệ thống:* Giám sát trạng thái hoạt động của hệ thống phần cứng (Service Health check), nắm quyền cao nhất trong luồng quản lý người dùng (User Management). Họ chịu trách nhiệm khởi tạo tập hồ sơ người dùng lớn, cấu hình phân lớp Role RBAC (Student/Lecturer) và giải quyết các vấn đề sự cố tài khoản.

```mermaid
flowchart LR
    Student((Sinh viên))
    Lecturer((Giảng viên))
    Admin((Quản trị viên))

    subgraph Tầng Tương tác Hệ thống CodeLearn [Hệ sinh thái CodeLearn]
        direction TB
        subgraph Core Học tập
            UC1(Đăng nhập / Đăng ký & Kích hoạt Email)
            UC2(Làm bài tập Web-IDE / Sandbox)
            UC3(Tham gia thi khảo sát - Exam / Assignment)
        end
        subgraph Tính năng Nâng cao
            UC4(Sử dụng AI Trợ lý - Gemini AI Companion)
            UC5(Thi đấu Battle / Xem Bảng xếp hạng Leaderboard)
            UC6(Tương tác nhóm Pair Rooms)
        end
        subgraph Quản trị Giáo án
            UC7(Biên soạn Boilerplate Code)
            UC8(Kiểm tra Đạo văn - Plagiarism Check)
            UC9(Quản lý Ngân hàng câu hỏi - Problem Bank)
            UC10(Xem Analytics & Thống kê sinh viên)
        end
        subgraph Quản trị Tổng
            UC11(Cấu hình hệ thống & Duyệt Onboarding)
            UC12(Xuất Report PDF/Docx - PrinceXML Engine)
        end
    end

    Student ---> UC1
    Student ---> UC2
    Student ---> UC3
    Student ---> UC4
    Student ---> UC5
    Student ---> UC6

    Lecturer ---> UC1
    Lecturer ---> UC7
    Lecturer ---> UC8
    Lecturer ---> UC9
    Lecturer ---> UC10
    Lecturer ---> UC12

    Admin ---> UC1
    Admin ---> UC11
    Admin ---> UC12
```

### 3.2. Thiết kế luồng nghiệp vụ cốt lõi (Core Business Flows)

Để giải quyết triệt để các "nỗi đau" (Pain points) đã nêu ở Phần 1, CodeLearn quy hoạch và pháp lý hóa hai nhóm luồng xử lý trọng tâm đặc biệt sau:

#### Nhóm 1: Tiến trình Đăng ký Sinh viên khép kín và An toàn (Closed Onboarding System)
Việc cho phép người dùng trên Internet tự do "Sign Up" thường dẫn đến lượng lớn dữ liệu rác. CodeLearn giải quyết bài toán định danh này theo tiêu chuẩn đại học bằng quy trình Onboarding xác thực vòng kín:
- **Bước 1 (Khởi tạo hàng loạt - Batch Import):** Quản trị viên (Admin) đẩy Upload danh sách sinh viên qua định dạng chuẩn file `.CSV` vào hệ thống. Các tài khoản này thay vì được Active ngay, sẽ được cơ sở dữ liệu (PostgreSQL) ghi nhận cẩn thận ở trạng thái chờ cấu hình (`Status: Pending Users`).
- **Bước 2 (Gửi Token Xác thực):** Hệ thống Event-Emitter tự động Trigger kích hoạt một tiến trình nền bất đồng bộ (Background job). Tiến trình này sinh ra các Mã bảo mật ngẫu nhiên mã hóa JWT (Temporary Credentials Token) có thời hạn 48 giờ và gửi qua giao thức SMTP đến hệ thống Email của từng sinh viên.
- **Bước 3 (Tiếp nhận và Định danh):** Sinh viên nhận email báo nhập học, bấm vào đường link chứa Query String kích hoạt. Tại đây, luồng Frontend chuyển hướng người dùng vào trang Profile Setup, yêu cầu sinh viên khai báo tính pháp lý (ví dụ: Ngày sinh, Chuyên ngành, Trường đại học, SĐT).
- **Bước 4 (Kích hoạt - Activate):** Khi Form được Submit, lời gọi API mang Payload cùng Token này được gửi về Backend. Node server giải mã Token, đối chiếu chữ ký (Signature), nếu mọi thứ an toàn nó tiến hành cập nhật Data, thay đổi trạng thái vòng đời tài khoản thành `Active` và cấp quyền đăng nhập chính thức.

```mermaid
sequenceDiagram
    actor Admin as Quản trị viên
    participant FE as Frontend Portal
    participant API as Auth API & User Module
    participant Email as Email Service
    participant DB as PostgreSQL DB
    actor Student as Sinh viên

    Admin->>FE: Upload file CSV danh sách Sinh viên đợt mới
    FE->>API: POST /admin/users/onboarding/batch
    API->>DB: Map & Lưu dữ liệu vào bảng tạm (Status: Pending)
    API-->>API: Async Workers: Tạo Temporary JWT Credentials 
    API->>Email: Trigger Event Gửi Thư mời học + Token
    Email->>Student: Sinh viên nhận Email chứa Activation Link
    Student->>FE: Click Link, mở giao diện Hoàn thiện Hồ sơ
    FE->>Student: Yêu cầu Cập nhật Mật khẩu, SĐT, Mã Đại học
    Student->>FE: Submit Form (Kèm Temporary Token)
    FE->>API: PATCH /auth/activate-profile
    API->>DB: Xác thực Token, Update Profile, cấp quyền Role = 'STUDENT'
    DB-->>API: Success
    API-->>FE: Trả về AccessToken (Đăng nhập chính thức)
    FE->>Student: Chuyển hướng vào Dashboard Học tập
```

#### Nhóm 2: Thuật toán quy hoạch bài tập "Điền vào chỗ trống" (Boilerplate Protection Workspace Flow)
Đây là quy trình độc quyền có hàm lượng sáng tạo cao nhất của CodeLearn, bảo vệ tính toàn vẹn của mã nguồn mẫu.
- **Bước 1 (Thiết lập ranh giới - Marking chunk):** Giảng viên tạo khung bài tập chuẩn (Boilerplate) trên UI. Bằng cách thao tác phủ khối trực quan, hệ thống thu thập tọa độ (Start-line, End-line) ghi ranh giới cho phép sinh viên tác động thành một Metadata JSON riêng biệt.
- **Bước 2 (Kiểm soát môi trường Client):** Khi Sinh viên mở Workspace để học, hệ thống API tiến hành khóa cứng (Read-only lock) lên toàn bộ các DOM thao tác File Tree. Biến thể UI (Monaco Editor Context) cấu hình lại, buộc sinh viên chỉ có thể chèn code vào các khối ranh giới (Editor boundaries). Mọi thao tác Ctrl+X, Delete ngoài lề đều bị Event Listener gạt bỏ.
- **Bước 3 (Đồng bộ lắp ghép An toàn - Server Secure Merge):** Trong quá trình nộp bài (Submit), để phòng ngừa sinh viên sử dụng Postman hay cURL giả mạo Request sửa đổi lõi, Payload API chỉ cho phép chứa phần Code thuộc block hợp lệ. Payload cục bộ gửi lên sẽ được chặn ở tầng Service Backend. Dữ liệu đoạn code rời rạc của sinh viên sẽ được dịch ngược về Server, sau đó Engine Merge tiến hành nội suy, trộn "khéo léo" vào khung Boilerplate vô hình giấu mặt tại tầng Backend. Đoạn mã "nguyên vẹn và không chứa mã độc sửa Test-case" này mới được đóng gói gửi vào Sandbox Docker để chấm điểm tự động.

```mermaid
flowchart TD
    Start([Bắt đầu tiến trình bảo vệ bài tập]) --> A[Giáo viên nhập yêu cầu, điểm số vào Ngân hàng câu hỏi]
    A --> B{Xác định dạng cấu trúc Code?}
    B -->|Mã nguồn Tự do| C[Hệ thống cấp phát File trống]
    B -->|Điền vào chỗ trống| D[Khởi tạo Hệ thống Boilerplate Code]
    D --> E[Sử dụng Editor UI để bôi đen phân vùng cho sửa]
    E --> F[Sinh Metadata: locked_lines / read_only_chunks]
    F --> G[Lưu ẩn cấu trúc Test-cases vào Database nội bộ]
    G --> H[Hoàn tất bài giảng]
    H --> End([Bài toán đưa vào Assignment / Exam])
```

### 3.3. Thiết kế Cấu trúc Cơ sở dữ liệu hạt nhân (Data Modeling - ERD)

Cấu trúc CSDL được hệ thống hóa chuẩn 3NF (Third Normal Form) để tránh dị thường dữ liệu (Data Anomalies) trong quá trình Scale-up đón nhận hàng vạn sinh viên, xử lý truy vấn chéo (JOIN operations) với tốc độ cao. Các thực thể (Entities) cốt lõi bao gồm:

1. **Thực thể USER (Người dùng):** Trung tâm định danh, phân quyền RBAC và quản lý hồ sơ năng lực.
2. **Thực thể PROBLEM & TESTCASE (Học liệu):** Lưu trữ đa dạng các loại bài tập từ tiêu chuẩn đến điền vào chỗ trống, đi kèm hệ thống kiểm thử tự động.
3. **Thực thể SUBMISSIONS (Giao dịch nộp bài):** Lưu trữ toàn bộ lịch sử code và kết quả đánh giá để phục vụ tra soát và chống đạo văn.
4. **Thực thể EXAM & BATTLE (Đánh giá & Tương tác):** Quản lý các kỳ thi tập trung và các trận đấu đối kháng thời gian thực.

```mermaid
erDiagram
    %% --- NHÓM NGƯỜI DÙNG & HỆ THỐNG ---
    USER ||--o{ AUDIT_LOG : "sinh nhật ký"
    USER ||--o{ ENROLLMENT : "đăng ký học"
    USER ||--o{ USER_WORKSPACE : "sở hữu"
    USER ||--o{ USER_SKILL_NODE : "phát triển kỹ năng"
    USER ||--o{ BATTLE_SESSION : "tham gia thi đấu"
    USER ||--o{ ROOM_PARTICIPANT : "tham gia phòng"
    SYSTEM_SETTING ||--o{ USER : "áp dụng cho"

    %% --- NHÓM KHÓA HỌC & ĐÀO TẠO ---
    COURSE ||--o{ ENROLLMENT : "có học viên"
    COURSE ||--o{ ASSIGNMENT : "giao bài tập"
    COURSE ||--o{ EXAM : "tổ chức kỳ thi"

    %% --- NHÓM NGÂN HÀNG ĐỀ THI & BÀI TOÁN ---
    QUESTION_BANK ||--o{ BANK_ITEM : "lưu trữ"
    BANK_ITEM ||--o{ PROBLEM : "tham chiếu"
    PROBLEM ||--o{ PROBLEM_VERSION : "quản lý phiên bản"
    PROBLEM ||--o{ PROBLEM_LANGUAGE_FILE : "định nghĩa ngôn ngữ"
    PROBLEM ||--o{ PROBLEM_STATS : "thống kê hiệu năng"
    PROBLEM ||--o{ TESTCASE : "kiểm thử bởi"
    PROBLEM ||--o{ ASSIGNMENT_PROBLEM : "gán vào assignment"
    PROBLEM ||--o{ EXAM_PROBLEM : "gán vào exam"
    PROBLEM_LANGUAGE_FILE }|--|| LANGUAGE : "sử dụng"
    PROBLEM_LANGUAGE_FILE ||--o{ PROBLEM_FILE : "chứa mã nguồn mẫu"

    %% --- NHÓM ĐÁNH GIÁ (ASSIGNMENT/EXAM) ---
    ASSIGNMENT ||--o{ ASSIGNMENT_PROBLEM : "bao gồm"
    EXAM ||--o{ EXAM_PROBLEM : "bao gồm"
    EXAM ||--o{ EXAM_ATTEMPT : "lượt làm bài"
    EXAM_ATTEMPT ||--o{ EXAM_LOG : "giám sát hành vi"

    %% --- NHÓM LUỒNG CHẤM BÀI (SUBMISSION) ---
    ASSIGNMENT_PROBLEM ||--o{ SUBMISSION : "nhận lời giải"
    EXAM_PROBLEM ||--o{ SUBMISSION : "nhận lời giải"
    SUBMISSION ||--o{ SUBMISSION_FILE : "mã nguồn nộp"
    SUBMISSION ||--o{ SUBMISSION_RESULT : "kết quả chi tiết"
    SUBMISSION ||--o{ EXECUTION_JOB : "định danh hàng đợi"

    %% --- NHÓM WORKSPACE & CỘNG TÁC ---
    USER_WORKSPACE ||--o{ WORKSPACE_FILE : "tệp tin cá nhân"
    ROOM ||--o{ ROOM_PARTICIPANT : "thành viên"
    ROOM ||--o{ ROOM_SESSION : "phiên làm việc"
    ROOM_SESSION ||--o{ BATTLE_SESSION : "khởi tạo trận đấu"

    USER {
        uuid id PK
        string email UK
        enum role "ADMIN, LECTURER, STUDENT"
        json profile_info "phone, university, xp, rank"
        datetime created_at
    }
    PROBLEM {
        uuid id PK
        string title
        enum difficulty "EASY, MEDIUM, HARD"
        boolean is_public
        integer time_limit_ms
    }
    SUBMISSION {
        uuid id PK
        uuid user_id FK
        uuid exercise_id FK
        enum status "AC, WA, TLE, CE, PENDING"
        float score
        text final_code
    }
    BATTLE_SESSION {
        uuid id PK
        uuid winner_id FK
        enum state "WAITING, IN_PROGRESS, FINISHED"
        datetime match_time
    }
    EXAM {
        uuid id PK
        string title
        datetime start_at
        datetime end_at
        boolean proctoring_enabled
    }
```


### 3.4. Kiến trúc luồng Thực thi ảo hóa (Sandbox Submission Workflow)
Nhằm bảo vệ hệ thống trước sự cố nghẽn mạng cục bộ, quy trình chấm bài code của sinh viên được thiết kế theo cơ chế Pub/Sub hoàn toàn bất đồng bộ (Asynchronous Design):
1. **Tiếp nhận API / Hàng đợi (Queue Buffering):** Web server tiếp nhận mã nguồn, nhưng tuyệt đối không chạy lệnh ngay. Mã nguồn và bài toán được đóng gói, dán nhãn Job và đẩy vào **Redis Queue** để bảo đảm hàng đợi FIFO ổn định nhờ Engine **BullMQ**.
2. **Worker xử lý biệt lập (Isolated Sandboxing):** Nhóm máy chủ nhận nhiệm vụ (Worker Nodes) tiến hành Consume job từ hàng đợi. Nó khởi tạo một container **Docker** ngắn hạn cách ly tài nguyên (CPU, RAM). Bên trong rào cản này, code sinh viên được biên dịch, truyền Input thông qua Pipe và xuất ra Log đầu ra trong giới hạn 2 giây (Time Limits).
3. **Phản hồi thời gian thực qua WebSockets:** Kết quả Test-case xuất về được ghi thẳng vào Database và phát sự kiện Broadcast thông qua **Socket.io**. Phía giao diện của sinh viên sẽ tự bắt event đổi trạng thái sang hiệu ứng Màu xanh (Passed) hay Đỏ (Compiler Error) ngay lập tức mà không cần F5 trình duyệt. Đồng thời, API phụ được kích hoạt để hỏi Gemini AI nhằm giải thích chi tiết lỗi để đút kết thành log phản hồi cho sinh viên.

```mermaid
graph TB
    subgraph Client_Layer [Tầng Giao diện (Next.js)]
        FE(Frontend Portal)
        WS_Client(WebSocket Client)
    end

    subgraph API_Layer [Tầng Nghiệp vụ (NestJS)]
        Gate(Gateway / Controllers)
        Auth(Auth Service)
        Prob(Problem Service)
        Exec(Execution Service)
        AI_S(Gemini AI Service)
    end

    subgraph Data_Layer [Tầng Lưu trữ & Hàng đợi]
        DB[(PostgreSQL)]
        Redis_Queue{Redis Queue / BullMQ}
    end

    subgraph Execution_Layer [Tầng Thực thi Sandbox]
        W1(Worker Node 1)
        W2(Worker Node 2)
        Docker1[[Docker Container 1]]
        Docker2[[Docker Container 2]]
    end

    FE -->|HTTPS / JWT| Gate
    Gate --> Auth
    Gate --> Prob
    Gate --> Exec
    
    Exec -->|Push Job| Redis_Queue
    Redis_Queue -->|Pull Job| W1
    Redis_Queue -->|Pull Job| W2
    
    W1 --> Docker1
    W2 --> Docker2
    
    Docker1 -->|Ghi điểm| DB
    W1 -->|Push Event| WS_Client
    
    Exec --> AI_S
    AI_S -.->|Gemini AI Flash 2.0| Exec
```

#### Quy trình chấm bài Chi tiết (Submission Lifecycle Sequence)

```mermaid
sequenceDiagram
    autonumber
    participant S as Sinh viên
    participant FE as Frontend Portal
    participant API as Backend API
    participant Q as Redis Queue
    participant W as Worker Node
    participant D as Docker Sandbox
    participant AI as Gemini AI

    S->>FE: Bấm nút "Submit Code"
    FE->>API: POST /submissions (Source Code + Prob ID)
    API->>API: Kiểm tra ranh giới Boilerplate & Gộp Code
    API->>Q: Đẩy Job vào BullMQ (Status: PENDING)
    API-->>FE: Trả về SubmissionID (HTTP 202 Accepted)
    FE->>S: Hiển thị trạng thái "Đang trong hàng đợi..."

    loop Chờ Worker
        W->>Q: Pull Job từ Redis
    end
    
    W->>D: Khởi tạo Container (Resource Limits)
    W->>D: Copy Code, Chạy Testcases qua Pipe
    D-->>W: Xuất Standard Output / Error
    W->>API: Cập nhật kết quả chấm bài (AC / WA / TLE)
    W->>FE: Phát tín hiệu WebSocket (Submission SUCCESS / FAILED)
    FE->>S: Đổi màu UI sang Xanh/Đỏ

    opt Nếu bài làm bị lỗi
        API->>AI: Gửi Source Code + Lỗi biên dịch
        AI-->>API: Trả về giải thích lỗi & gợi ý hướng sửa
        API->>FE: Đẩy gợi ý AI vào Tab "AI Assistant"
    end
```

### 3.5. Thiết kế Logic các tính năng mở rộng (Advanced Features Logic)

#### 3.5.1. Chế độ thi đấu Đối kháng (Battle Mode State-Machine)
Tính năng thi đấu yêu cầu sự đồng bộ trạng thái cực cao giữa các người chơi thông qua nền tảng Socket.io.

```mermaid
stateDiagram-v2
    [*] --> LOBBY: Chủ phòng tạo Battle
    LOBBY --> LOBBY: join_room (Người chơi gia nhập)
    LOBBY --> IN_PROGRESS: start_battle (Bắt đầu)
    
    state IN_PROGRESS {
        [*] --> CODING: Nhận đề bài
        CODING --> SUBMITTING: Nộp bài (Execution Flow)
        SUBMITTING --> CODING: Kết quả Sai (WA/TLE)
        SUBMITTING --> FINISHED_USER: Kết quả AC (Hoàn thành)
    }
    
    IN_PROGRESS --> EVALUATING: Hết giờ (Timeout) hoặc Tất cả hoàn thành
    EVALUATING --> COMPLETED: Tính toán Xếp hạng & Cộng điểm XP
    COMPLETED --> [*]
```

#### 3.5.2. Lộ trình học tập cá nhân hóa (Learning Path Mastery)
Dựa trên lịch sử Submission, hệ thống sử dụng cấu trúc cây kỹ năng (Skill Tree) để gợi ý bài tập tiếp theo.

```mermaid
graph LR
    Sub(Lịch sử Nộp bài) --> Engine(Phân tích Score & Difficulty)
    Engine --> SkillMap{Cập nhật Skill Node}
    SkillMap -->|Mastered| NextLevel(Mở khóa bài tập nâng cao)
    SkillMap -->|Weak| AI_Suggest(Gemini AI gợi ý tài liệu ôn tập)
    NextLevel --> Dashboard(Cập nhật UI Lộ trình)
```
