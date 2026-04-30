# CHƯƠNG 3. PHÂN TÍCH MÔ HÌNH NGHIỆP VỤ VÀ CHI TIẾT THỰC THỂ HỆ THỐNG

Chương này tập trung vào việc giải phẫu toàn diện kiến trúc dữ liệu và các luồng nghiệp vụ của CodeLearn. Thay vì tiếp cận theo hướng mô tả chức năng, chúng tôi đi sâu vào từng thuộc tính (field) của các thực thể (entities), các mối quan hệ (relationships) và các quy trình rẽ nhánh logic nhằm đảm bảo hệ thống có khả năng vận hành ổn định, bảo mật và đáp ứng các tiêu chuẩn khắt khe của một đồ án tốt nghiệp chuyên sâu.

### 3.1. Phân tích chi tiết các Phân hệ Thực thể (Detailed Entities Analysis)

Để quản lý một lượng lớn dữ liệu phát sinh từ hàng ngàn sinh viên và hàng triệu lượt nộp bài, CodeLearn quy hoạch dữ liệu thành 5 phân hệ thực thể hạt nhân. Dưới đây là phân tích chi tiết từng trường dữ liệu và ý nghĩa kỹ thuật của chúng.

#### 3.1.1. Phân hệ Quản trị Người dùng và Lộ trình (User & Learning Path Module)

Phân hệ này không chỉ lưu trữ thông tin cá nhân mà còn theo dõi sự phát triển kỹ năng của sinh viên thông qua cấu trúc cây (Tree structure).

**A. Thực thể USER (Người dùng)**
Thực thể trung tâm, định danh mọi tác nhân tham gia hệ thống.

| Tên trường | Kiểu dữ liệu | Đặc điểm | Ý nghĩa & Vai trò |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Unique | Định danh duy nhất toàn cầu, tránh việc đoán ID qua URL. |
| `email` | String(150) | Unique, Index | Email chính quy do nhà trường cấp, dùng để đăng nhập. |
| `fullName` | String(100) | Not Null | Họ và tên đầy đủ để xuất báo cáo PDF/Word. |
| `avatarUrl` | String | Nullable | Đường dẫn ảnh đại diện người dùng trên Cloud Storage. |
| `role` | Enum | Not Null | Phân quyền: ADMIN, LECTURER, STUDENT (RBAC). |
| `passwordHash`| String | Encrypted | Lưu trữ mật khẩu đã mã hóa (bcrypt/argon2). |
| `status` | String | Default: 'active'| Trạng thái tài khoản (Active, Pending, Blocked). |
| `rating` | Integer | Default: 1500 | Chỉ số Elo phản ánh trình độ thi đấu Code Battle. |
| `xp` | Integer | Default: 0 | Điểm kinh nghiệm tích lũy từ các bài tập tự luyện. |
| `createdAt` | DateTime | Default: Now | Thời điểm khởi tạo tài khoản trên hệ thống. |
| `lastLoginAt` | DateTime | Nullable | Thời điểm cuối cùng người dùng truy cập hệ thống. |

**B. Thực thể USER_SKILL_NODE (Nút kỹ năng)**
Đại diện cho một kỹ năng (ví dụ: "Mảng 1 chiều", "Đệ quy") trong cây lộ trình học tập.

| Tên trường | Kiểu dữ liệu | Đặc điểm | Ý nghĩa & Vai trò |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Định danh duy nhất cho nút kỹ năng. |
| `userId` | UUID | FK, Index | Tham chiếu đến người dùng sở hữu lộ trình kỹ năng này. |
| `parentId` | UUID | FK, Nullable | Khóa ngoại tham chiếu đến chính nó, tạo cấu trúc cây. |
| `tag` | String | Not Null | Nhãn kỹ năng (ví dụ: 'Array', 'Recursion'). |
| `progress` | Float | Default: 0 | Tỷ lệ hoàn thành các bài tập thuộc kỹ năng (0.0 - 1.0). |
| `status` | Enum | Default: 'LOCKED'| Trạng thái: `LOCKED`, `ACTIVE`, `DONE`. |
| `updatedAt` | DateTime | Default: Now | Thời điểm cập nhật tiến độ kỹ năng gần nhất. |
| `position_x/y` | Float | Not Null | Tọa độ để vẽ sơ đồ Skill Tree trên Frontend (Canvas). |

***

#### 3.1.2. Phân hệ Quản lý Bài tập và Tài nguyên (Problem & Asset Module)

Phân hệ này được thiết kế theo mô hình **Versioning** (Quản lý phiên bản) để đảm bảo tính lịch sử và không làm gãy các lượt nộp bài cũ khi đề bài thay đổi.

**A. Thực thể PROBLEM (Bài toán)**
Thực thể gốc chứa các thông tin định danh bài tập.

| Tên trường | Kiểu dữ liệu | Đặc điểm | Ý nghĩa & Vai trò |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Khóa chính định danh bài tập. |
| `title` | String(255) | Not Null | Tiêu đề bài tập hiển thị trên danh sách. |
| `slug` | String | Unique, Index | Chuỗi định danh URL, hỗ trợ SEO và truy cập nhanh. |
| `difficulty` | Enum | Index | Cấp độ khó: EASY, MEDIUM, HARD. |
| `tags` | Array[String]| Index | Danh sách nhãn kỹ năng (ví dụ: Math, DP, Greedy). |
| `authorId` | UUID | FK | Giảng viên tạo hoặc sở hữu bài tập này. |
| `totalSubmissions`| Integer | Default: 0 | Tổng số lượt nộp bài tính đến hiện tại. |
| `acceptedCount` | Integer | Default: 0 | Số lượt nộp bài thành công (Accepted). |
| `visibility` | Enum | Default: 'PUBLIC' | PUBLIC (Công khai), PRIVATE (Nội bộ lớp học). |
| `current_version_id`| UUID | FK, Nullable | Trỏ tới phiên bản đang được áp dụng để chấm điểm. |
| `createdAt` | DateTime | Default: Now | Thời điểm bài tập được khởi tạo. |

**B. Thực thể PROBLEM_VERSION (Phiên bản bài tập)**
Lưu trữ nội dung chi tiết của một lần cập nhật đề bài.

| Tên trường | Kiểu dữ liệu | Đặc điểm | Ý nghĩa & Vai trò |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Khóa chính của phiên bản bài tập. |
| `description` | JSONB | Not Null | Nội dung đề bài định dạng Markdown (hỗ trợ công thức Toán, Code). |
| `workspaceConfig` | JSONB | Not Null | Cấu hình các tab file mặc định khi sinh viên mở Editor. |
| `entryFile` | String | Not Null | Đường dẫn file chính (ví dụ: `main.cpp`) mà Sandbox sẽ thực thi. |
| `isVerified` | Boolean | Default: false | Đánh dấu phiên bản đã được Giảng viên chạy thử thành công. |

**C. Thực thể PROBLEM_FILE (Tệp tin mã nguồn mẫu)**
Lưu trữ các tệp tin cấu thành nên một bài tập, đặc biệt quan trọng cho dạng bài "Điền vào chỗ trống".

| Tên trường | Kiểu dữ liệu | Đặc điểm | Ý nghĩa & Vai trò |
| :--- | :--- | :--- | :--- |
| `path` | String | Not Null | Đường dẫn file trong cấu trúc thư mục ảo của sinh viên. |
| `content` | Text | Nullable | Nội dung mã nguồn mẫu (Boilerplate). |
| `type` | Enum | Not Null | Loại file: `TEMPLATE` (Cho phép sửa), `SOLUTION`, `NEUTRAL`. |
| `isReadonly` | Boolean | Default: false | Cờ bảo vệ ngăn sinh viên xóa hoặc sửa đổi các tệp cấu trúc lõi. |
| `isFillInTheBlank` | Boolean | Default: false | Đánh dấu tệp chứa các phân vùng ranh giới (Marking chunks). |

***

#### 3.1.3. Phân hệ Kiểm thử và Đánh giá (Testcase & Submission Module)

Đây là phân hệ lưu trữ khối lượng dữ liệu lớn nhất, đòi hỏi sự tối ưu hóa cao về chỉ mục (Indexing) và truy vấn.

**A. Thực thể TESTCASE (Bộ kiểm thử)**
Dữ liệu dùng để đối soát kết quả đầu ra của sinh viên.

| Tên trường | Kiểu dữ liệu | Đặc điểm | Ý nghĩa & Vai trò |
| :--- | :--- | :--- | :--- |
| `input` | Text | Nullable | Dữ liệu đầu vào truyền qua Standard Input (stdin). |
| `expectedOutput` | Text | Not Null | Kết quả mong đợi để so khớp (Exact match / Partial match). |
| `score` | Integer | Default: 0 | Trọng số điểm cho testcase này (ví dụ: 10 điểm). |
| `isHidden` | Boolean | Default: true | Nếu là `true`, sinh viên không thấy Input/Output này. |

**B. Thực thể SUBMISSION (Lượt nộp bài)**
Lưu trữ bằng chứng học tập và kết quả chấm điểm.

| Tên trường | Kiểu dữ liệu | Đặc điểm | Ý nghĩa & Vai trò |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | Khóa chính định danh lượt nộp bài. |
| `userId` | UUID | FK, Index | Sinh viên thực hiện lượt nộp bài này. |
| `problemVersionId`| UUID | FK | Phiên bản bài tập được sử dụng để chấm điểm. |
| `languageId` | Integer | FK | Ngôn ngữ lập trình được sử dụng (C++, Java, Python...). |
| `status` | Enum | Index | Trạng thái: `AC`, `WA`, `TLE`, `CE`, `PENDING`, `RUNNING`. |
| `finalCode` | Text | Not Null | Toàn bộ mã nguồn sinh viên đã nộp để lưu trữ lịch sử. |
| `score` | Float | Default: 0 | Điểm số đạt được trong lượt nộp này. |
| `executionTime` | Integer | Unit: ms | Thời gian thực thi lâu nhất trong các test case. |
| `memoryUsage` | Integer | Unit: KB | Lượng tài nguyên RAM tiêu thụ cao nhất. |
| `createdAt` | DateTime | Default: Now | Thời điểm nộp bài (dùng để kiểm soát deadline). |

#### 3.1.4. Phân hệ Đào tạo và Thi cử (Exam & Assignment Module)

Phân hệ này quản lý các kỳ kiểm tra tập trung, đòi hỏi sự kiểm soát nghiêm ngặt về thời gian và tính ngẫu nhiên của đề thi.

**A. Thực thể EXAM (Kỳ thi tập trung)**
Quản lý các thông số vận hành của một kỳ thi chính thức.

| Tên trường | Kiểu dữ liệu | Đặc điểm | Ý nghĩa & Vai trò |
| :--- | :--- | :--- | :--- |
| `startTime` | DateTime | Not Null | Thời điểm hệ thống mở cổng thi. |
| `endTime` | DateTime | Not Null | Thời điểm hệ thống đóng cổng thi. |
| `duration` | Integer | Unit: Minute | Thời lượng làm bài tính bằng phút (ví dụ: 90 phút). |
| `allowedLanguages` | Array[Int] | FK | Danh sách các ngôn ngữ lập trình được phép sử dụng. |
| `isPerUserRandom` | Boolean | Default: false | Mỗi sinh viên sẽ nhận được một bộ đề bài ngẫu nhiên. |
| `generationRules` | JSONB | Nullable | Các quy tắc chọn đề từ ngân hàng câu hỏi. |

**B. Thực thể EXAM_LOG (Nhật ký giám thi số)**
Lưu trữ các hành vi của sinh viên trong quá trình thi.

| Tên trường | Kiểu dữ liệu | Đặc điểm | Ý nghĩa & Vai trò |
| :--- | :--- | :--- | :--- |
| `event_type` | String | Index | `TAB_SWITCH`, `PASTE`, `CONNECTION_LOST`. |
| `metadata` | JSONB | Nullable | Lưu thông tin chi tiết về sự kiện diễn ra. |

***

#### 3.1.5. Phân hệ Thi đấu và Cộng tác thời gian thực (Battle & Room Module)

Đây là phân hệ ứng dụng công nghệ WebSockets (Socket.io) để duy trì sự đồng bộ trạng thái giữa các người chơi.

**A. Thực thể BATTLE_SESSION (Trận đấu đối kháng)**
Quản lý vòng đời của một trận Solo Battle 1vs1.

| Tên trường | Kiểu dữ liệu | Đặc điểm | Ý nghĩa & Vai trò |
| :--- | :--- | :--- | :--- |
| `player1_id` | UUID | FK | Người chơi thứ nhất. |
| `player2_id` | UUID | FK | Người chơi thứ hai (đối thủ). |
| `p1_progress` | Integer | Default: 0 | Số lượng test case đã vượt qua của người 1. |
| `winner_id` | UUID | FK, Nullable | Định danh người chiến thắng trận đấu. |
| `status` | Enum | Not Null | Trạng thái: `WAITING`, `ACTIVE`, `ENDED`. |

**B. Thực thể ROOM (Phòng học nhóm)**
Không gian cho phép giảng viên hướng dẫn hoặc sinh viên cùng học tập.

| Tên trường | Kiểu dữ liệu | Đặc điểm | Ý nghĩa & Vai trò |
| :--- | :--- | :--- | :--- |
| `type` | Enum | Not Null | Loại phòng: `MEETING` (Video), `CODE` (IDE). |
| `problem_slug` | String | FK | Bài tập mà cả phòng đang cùng thực hiện. |
| `maxParticipants` | Integer | Default: 10 | Giới hạn số lượng người tham gia tối đa. |

***

### 3.2. Sơ đồ Cơ sở Dữ liệu Phân mảnh (Detailed Module ERDs)

Thay vì một sơ đồ tổng quát khó quan sát, chúng tôi phân tách thành các ERD chi tiết cho từng nhóm nghiệp vụ.

#### 3.2.1. ERD Nhóm Người dùng & Đào tạo (User & Enrollment)
Sơ đồ này thể hiện mối quan hệ giữa sinh viên, lớp học và lộ trình kỹ năng.

```mermaid
erDiagram
    USER ||--o{ ENROLLMENT : "đăng ký"
    USER ||--o{ USER_SKILL_NODE : "có"
    COURSE ||--o{ ENROLLMENT : "chứa"
    COURSE ||--o{ ASSIGNMENT : "giao bài"

    USER {
        id uuid PK
        email string
        fullName string
        role enum
        rating int
        xp int
        createdAt datetime
    }
    ENROLLMENT {
        id uuid PK
        user_id uuid FK
        course_id uuid FK
        status string
        enrolled_at datetime
    }
    USER_SKILL_NODE {
        id uuid PK
        user_id uuid FK
        parent_id uuid FK
        tag string
        progress float
        status enum
    }
    COURSE {
        id uuid PK
        title string
        author_id uuid FK
    }
    ASSIGNMENT {
        id uuid PK
        course_id uuid FK
        problem_id uuid FK
        deadline datetime
    }
```

#### 3.2.2. ERD Nhóm Bài tập & Kiểm thử (Problem & Submission)
Đây là cấu trúc "xương sống" xử lý logic chấm điểm của CodeLearn.

```mermaid
erDiagram
    PROBLEM ||--o{ PROBLEM_VERSION : "có"
    PROBLEM_VERSION ||--o{ PROBLEM_FILE : "chứa"
    PROBLEM_VERSION ||--o{ TESTCASE : "kiểm thử bằng"
    PROBLEM_VERSION ||--o{ SUBMISSION : "nhận"
    SUBMISSION ||--o{ SUBMISSION_RESULT : "chi tiết"
    PROBLEM_FILE }|--|| LANGUAGE : "ngôn ngữ"
    
    PROBLEM {
        id uuid PK
        title string
        slug string
        difficulty enum
        author_id uuid FK
    }
    PROBLEM_VERSION {
        id uuid PK
        problem_id uuid FK
        version_number int
        description jsonb
        entry_file string
    }
    SUBMISSION {
        id uuid PK
        user_id uuid FK
        problem_version_id uuid FK
        status enum
        score float
        execution_time int
        createdAt datetime
    }
    SUBMISSION_RESULT {
        id uuid PK
        submission_id uuid FK
        testcase_id uuid FK
        passed boolean
        runtime int
    }
    TESTCASE {
        id uuid PK
        version_id uuid FK
        input text
        expected_output text
        score int
    }
```

#### 3.2.3. ERD Nhóm Thi cử & Đào tạo (Exam & Course)
```mermaid
erDiagram
    COURSE ||--o{ EXAM : "tổ chức"
    COURSE ||--o{ ASSIGNMENT : "giao bài"
    QUESTION_BANK ||--o{ EXAM : "cung cấp đề"
    EXAM ||--o{ EXAM_ATTEMPT : "có lượt làm"
    EXAM_ATTEMPT ||--o{ EXAM_LOG : "sinh nhật ký"

    EXAM {
        id uuid PK
        course_id uuid FK
        title string
        description text
        status string
        start_time datetime
        end_time datetime
        creator_id uuid FK
    }
    EXAM_ATTEMPT {
        id uuid PK
        exam_id uuid FK
        user_id uuid FK
        started_at datetime
        completed_at datetime
        total_score float
    }
    EXAM_LOG {
        id uuid PK
        attempt_id uuid FK
        event_type string
        metadata jsonb
        timestamp datetime
    }
```

#### 3.2.4. ERD Nhóm Cộng tác & Thi đấu (Collaboration & Battle)
```mermaid
erDiagram
    ROOM ||--o{ ROOM_PARTICIPANT : "có thành viên"
    ROOM ||--o{ ROOM_SESSION : "phiên làm việc"
    ROOM_SESSION ||--o{ BATTLE_SESSION : "khởi tạo"
    USER ||--o{ ROOM_PARTICIPANT : "tham gia"

    ROOM {
        id uuid PK
        title string
        host_id uuid FK
        problem_slug string
        type enum
        status string
        createdAt datetime
    }
    ROOM_PARTICIPANT {
        id uuid PK
        room_id uuid FK
        user_id uuid FK
        joined_at datetime
    }
    BATTLE_SESSION {
        id uuid PK
        room_session_id uuid FK
        winner_id uuid FK
        player1_id uuid FK
        player2_id uuid FK
        status string
    }
```

***

### 3.3. Thiết kế các Luồng Nghiệp vụ Sequence Chi tiết (Sequence Diagrams)

Phần này đặc tả trình tự giao tiếp giữa Client, Server, Database và các dịch vụ bên thứ 3 (AI, Sandbox).

#### 3.3.1. Luồng Chấm bài Tự động với Cơ chế Hàng đợi (Execution Flow)
Đây là luồng quan trọng nhất, đảm bảo hệ thống không bị quá tải.

```mermaid
sequenceDiagram
    autonumber
    participant S as Sinh viên (Frontend)
    participant API as Backend (NestJS)
    participant Q as Queue (Redis/BullMQ)
    participant W as Worker (Docker Sandbox)
    participant DB as Database (PostgreSQL)

    S->>API: POST /submissions (Source Code + ProbID)
    API->>API: Validate Boilerplate & Auth
    API->>DB: Lưu Submission (Status: PENDING)
    API->>Q: Đẩy Job vào Queue
    API-->>S: Trả về SubmissionID (HTTP 202)
    
    W->>Q: Nhận Job (Long Polling)
    W->>W: Khởi tạo Docker Container
    W->>W: Chạy Testcases
    W-->>DB: Cập nhật Kết quả (AC/WA/TLE) & Score
    W-->>API: Notify Success via Event
    API-->>S: Gửi tín hiệu WebSocket (Update UI)
```

#### 3.3.2. Luồng Kiểm tra Đạo văn và Đối soát (Plagiarism Check Flow)
Luồng này giúp giảng viên đánh giá tính trung thực của sinh viên.

```mermaid
sequenceDiagram
    participant L as Giảng viên
    participant API as Backend
    participant Engine as Moss/Plagiarism Engine
    participant DB as Database

    L->>API: Yêu cầu Check Plagiarism cho Bài tập X
    API->>DB: Lấy danh sách finalCode của tất cả Sinh viên
    API->>Engine: Gửi gói Code so sánh
    Engine->>Engine: Thuật toán so khớp chuỗi/cấu trúc (AST)
    Engine-->>API: Trả về tỷ lệ % trùng lặp giữa các cặp
    API->>DB: Lưu báo cáo đạo văn
    API-->>L: Hiển thị Dashboard Đạo văn (Heatmap)
```

#### 3.3.3. Luồng Tương tác Trợ lý AI (AI Suggestion Flow)
```mermaid
sequenceDiagram
    participant S as Sinh viên
    participant API as Backend
    participant Gemini as Gemini AI API
    participant Prompt as Prompt Manager

    S->>API: Gửi mã lỗi + Mã nguồn đang viết
    API->>Prompt: Chèn Context (Đề bài, Testcase sai, Rule sư phạm)
    Prompt-->>API: Prompt hoàn thiện (Instruction)
    API->>Gemini: Gửi yêu cầu phân tích
    Gemini-->>API: Trả về hướng dẫn (Markdown)
    API-->>S: Hiển thị hướng dẫn trong Tab AI
```

### 3.4. Phân tích chi tiết Cấu trúc Dữ liệu Giao tiếp (API Payload Analysis)

Để đảm bảo tính nhất quán và hiệu năng, CodeLearn quy chuẩn hóa các gói tin JSON trao đổi giữa Frontend và Backend. Dưới đây là phân tích chi tiết cho hai luồng dữ liệu quan trọng nhất.

#### 3.4.1. Cấu trúc Gói tin nộp bài (Submission Payload)
Khi sinh viên bấm nút Submit, hệ thống không gửi toàn bộ file mà gửi một cấu trúc cây mã nguồn đã được định dạng.

**Endpoint:** `POST /api/submissions`
**Cấu trúc dữ liệu:**
```json
{
  "problemId": "uuid-v4-identifier",
  "languageId": 1, // 1: C++, 2: Java, 3: Python...
  "code": {
    "files": [
      {
        "path": "src/main.cpp",
        "content": "string_content_of_the_code",
        "isEntry": true
      },
      {
        "path": "src/utils.h",
        "content": "string_content_of_header"
      }
    ]
  },
  "metadata": {
    "clientTimestamp": "2026-04-30T...",
    "browserInfo": "Chrome/124.0.0",
    "isExamMode": false
  }
}
```
**Phân tích kỹ thuật:**
- `languageId`: Giúp Backend xác định chính xác Docker Image nào cần khởi tạo (ví dụ: `gcc:latest` cho C++).
- `files`: Cấu trúc mảng cho phép hệ thống mở rộng sang các bài tập đa file (Multi-file projects), một tính năng vượt trội so với các hệ thống chỉ hỗ trợ 1 file duy nhất.

#### 3.4.2. Giải thuật Nội suy và Bảo vệ ranh giới (Boilerplate Protection Algorithm)
Đây là phần lõi kỹ thuật nhằm ngăn chặn việc sinh viên can thiệp vào mã nguồn khung.

**Bước 1: Lưu trữ ranh giới (Server-side)**
Giảng viên định nghĩa vùng được phép sửa thông qua các thẻ đánh dấu ẩn trong code:
`/* START_STUDENT_CODE */` ... `/* END_STUDENT_CODE */`

**Bước 2: Đối soát khi nộp bài**
Khi nhận Payload từ Client, Backend thực hiện quy trình:
1.  Tải mã nguồn khung (Boilerplate) từ Database.
2.  Trích xuất phần mã sinh viên đã gửi trong mảng `files`.
3.  Sử dụng biểu thức chính quy (Regex) hoặc kỹ thuật cắt chuỗi để thay thế chính xác phần mã sinh viên vào giữa hai thẻ đánh dấu trong mã nguồn khung.
4.  Nếu sinh viên cố tình gửi mã nguồn nằm ngoài ranh giới (bằng cách sử dụng Postman hay can thiệp API), Engine Merge sẽ tự động loại bỏ hoặc báo lỗi `Security Violation`.

***

### 3.5. Thiết kế Giao diện lập trình (API Endpoints Specification)

Dưới đây là bảng đặc tả một số API hạt nhân phục vụ các phân hệ chính:

| Phương thức | Endpoint | Mô tả chức năng | Quyền hạn (Role) |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/problems` | Lấy danh sách bài tập kèm bộ lọc nâng cao. | ALL |
| `POST` | `/api/problems` | Khởi tạo bài tập mới, bao gồm định nghĩa Metadata. | LECTURER |
| `GET` | `/api/submissions/:id` | Lấy kết quả chấm bài chi tiết kèm log Sandbox. | OWNER / LECTURER |
| `POST` | `/api/battles/join` | Tìm kiếm và gia nhập phòng chờ đối kháng. | STUDENT |
| `PATCH` | `/api/admin/users/:id` | Cập nhật thông tin và trạng thái tài khoản. | ADMIN |
| `GET` | `/api/ai/suggest` | Gửi yêu cầu phân tích lỗi và nhận gợi ý từ AI. | STUDENT |

***
*Kết luận Chương 3: Với sự phân tách rõ ràng giữa các thực thể, luồng nghiệp vụ và đặc tả giao tiếp, hệ thống CodeLearn đã xây dựng được một nền tảng vững chắc, sẵn sàng cho việc hiện thực hóa các giao diện phức tạp ở Chương tiếp theo.*
