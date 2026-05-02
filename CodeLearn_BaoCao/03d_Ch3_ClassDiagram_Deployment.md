## 3.6. Biểu đồ lớp và ERD

### 3.6.1. Biểu đồ lớp phân hệ người dùng và lộ trình học
**Hình 3.24. Biểu đồ lớp phân hệ người dùng và lộ trình học**

```plantuml
@startuml CD_UserModule
skinparam monochrome true
!theme plain
skinparam classAttributeIconSize 0
title Biểu đồ Lớp: Phân hệ Người dùng và Lộ trình học

enum RoleEnum {
  ADMIN
  LECTURER
  STUDENT
}

class User {
  +id: UUID
  +email: String
  +fullName: String
  +mssv: String
  +role: RoleEnum
  +rating: Integer
  +xp: Integer
  +status: String
  --
  +hasRole(role: RoleEnum): Boolean
  +updateRating(delta: Integer): void
}

class UserSkillNode {
  +id: UUID
  +title: String
  +tag: String
  +difficulty: String
  +progress: Float
  +status: String
  +parentId: UUID
  --
  +unlock(): void
  +updateProgress(value: Float): void
}

User "1" -- "0..*" UserSkillNode : owns
UserSkillNode "0..1" -- "0..*" UserSkillNode : parent of
@enduml
```

### 3.6.2. Biểu đồ lớp phân hệ bài tập và quản lý phiên bản
**Hình 3.25. Biểu đồ lớp phân hệ bài tập và quản lý phiên bản**

```plantuml
@startuml CD_ProblemModule
skinparam monochrome true
!theme plain
skinparam classAttributeIconSize 0
title Biểu đồ Lớp: Phân hệ Bài tập và Quản lý phiên bản

class Problem {
  +id: UUID
  +title: String
  +slug: String
  +difficulty: String
  +type: String
  +visibility: String
  +timeLimit: Integer
  +memoryLimit: Integer
  --
  +publish(): void
  +createNewVersion(): ProblemVersion
}

class ProblemVersion {
  +description: JSONB
  +workspaceConfig: JSONB
  +isVerified: Boolean
  --
  +verify(): void
}

class Testcase {
  +input: Text
  +expectedOutput: Text
  +score: Integer
}

Problem "1" -- "1..*" ProblemVersion : has
ProblemVersion "1" -- "1..*" Testcase : defines
@enduml
```

### 3.6.3. Biểu đồ lớp phân hệ nộp bài và kết quả chấm
**Hình 3.26. Biểu đồ lớp phân hệ nộp bài và kết quả chấm**

```plantuml
@startuml CD_SubmissionModule
skinparam monochrome true
!theme plain
skinparam classAttributeIconSize 0
title Biểu đồ Lớp: Phân hệ Nộp bài và Kết quả chấm

class Submission {
  +id: UUID
  +code: Text
  +type: String
  +status: String
  +score: Float
  +runtime: Integer
  +memory: Integer
  +results: JSONB
  --
  +isAccepted(): Boolean
}

class ProblemVersion {
  +id: UUID
  +versionNumber: Integer
}

class Language {
  +id: Integer
  +name: String
}

Submission "0..*" -- "1" ProblemVersion : based on
Submission "0..*" -- "1" Language : written in
@enduml
```

### 3.6.4. Biểu đồ lớp tổng thể hệ thống CodeLearn
**Hình 3.27. Biểu đồ lớp tổng thể hệ thống CodeLearn**

```plantuml
@startuml CD_Overview
skinparam monochrome true
!theme plain
skinparam linetype ortho
title Biểu đồ Lớp Tổng thể — CodeLearn System

User "1" --> "0..*" Submission
Problem "1" --> "1..*" ProblemVersion
ProblemVersion "1" --> "0..*" Testcase
Submission "0..*" --> "1" ProblemVersion
@enduml
```

### 3.6.5. Sơ đồ thực thể liên kết cơ sở dữ liệu
**Hình 3.28. Sơ đồ thực thể liên kết cơ sở dữ liệu**

```plantuml
@startuml ERD_CodeLearn
skinparam monochrome true
!theme plain
title Sơ đồ Thực thể Liên kết (ERD) - Database Schema

entity "users" {
  *id : uuid <<PK>>
  --
  email : varchar(255)
  full_name : varchar(100)
  mssv : varchar(20)
  role : enum
  rating : integer
  xp : integer
}

entity "problems" {
  *id : uuid <<PK>>
  --
  title : varchar(255)
  difficulty : varchar(20)
  type : varchar(20)
  created_by : uuid <<FK>>
}

entity "submissions" {
  *id : uuid <<PK>>
  --
  user_id : uuid <<FK>>
  problem_version_id : uuid <<FK>>
  status : varchar(20)
  score : float
  results : text
}

users ||--o{ problems : "creates"
users ||--o{ submissions : "submits"
problems ||--o{ submissions : "has"
@enduml
```

---

## 3.7. Biểu đồ trạng thái

### 3.7.1. Biểu đồ trạng thái vòng đời bài nộp
**Hình 3.29. Biểu đồ trạng thái vòng đời bài nộp**

```plantuml
@startuml State_Submission
skinparam monochrome true
!theme plain
title Biểu đồ Trạng thái: Vòng đời của Bài nộp

[*] --> PENDING : SV nhấn Submit
PENDING --> RUNNING : Gửi sang Judge0
state RUNNING {
  [*] --> Compiling
  Compiling --> Executing
}
RUNNING --> AC : Success
RUNNING --> WA : Failed
AC --> [*]
WA --> [*]
@enduml
```

### 3.7.2. Biểu đồ trạng thái vòng đời bài tập
**Hình 3.30. Biểu đồ trạng thái vòng đời bài tập**

```plantuml
@startuml State_Problem
skinparam monochrome true
!theme plain
title Biểu đồ Trạng thái: Vòng đời của Bài tập (Problem)

[*] --> DRAFT : GV tạo mới
DRAFT --> PENDING_REVIEW : GV gửi phê duyệt
PENDING_REVIEW --> APPROVED : Admin duyệt
PENDING_REVIEW --> REJECTED : Admin từ chối
APPROVED --> PUBLIC : GV xuất bản
APPROVED --> PRIVATE : GV giữ riêng tư
PUBLIC --> PRIVATE : GV ẩn
PRIVATE --> PUBLIC : GV công bố lại
PUBLIC --> [*]
@enduml
```

### 3.7.3. Biểu đồ trạng thái vòng đời trận đấu Code Battle
**Hình 3.31. Biểu đồ trạng thái vòng đời trận đấu Code Battle**

```plantuml
@startuml State_Battle
skinparam monochrome true
!theme plain
title Biểu đồ Trạng thái: Vòng đời của Trận đấu (Battle)

[*] --> WAITING : Người chơi nhấn Find Match
WAITING --> MATCHED : Matchmaking thành công
MATCHED --> ONGOING : Cả hai xác nhận
ONGOING --> FINISHED : Một người đạt AC hoặc hết giờ
FINISHED --> [*]
WAITING --> CANCELLED : Người dùng huỷ
ONGOING --> CANCELLED : Kết nối bị ngắt
@enduml
```

### 3.7.4. Biểu đồ trạng thái vòng đời kỳ thi
**Hình 3.32. Biểu đồ trạng thái vòng đời kỳ thi**

```plantuml
@startuml State_Exam
skinparam monochrome true
!theme plain
title Biểu đồ Trạng thái: Vòng đời của Kỳ thi (Exam)

[*] --> SCHEDULED : GV tạo và xuất bản
SCHEDULED --> ONGOING : Đến giờ bắt đầu
ONGOING --> GRADING : Hết thời gian làm bài
GRADING --> FINISHED : Chấm điểm hoàn tất
SCHEDULED --> CANCELLED : GV hủy thi
FINISHED --> [*]
@enduml
```

---

## 3.8. Biểu đồ triển khai

### 3.8.1. Biểu đồ triển khai hệ thống CodeLearn
**Hình 3.33. Biểu đồ triển khai hệ thống CodeLearn**

```plantuml
@startuml DeploymentDiagram
!theme plain
skinparam monochrome true
skinparam shadowing false
title Biểu đồ Triển khai: Hệ thống CodeLearn (Multi-tier)

node "Client Side" <<Device>> {
  node "Web Browser" {
    artifact "Next.js Static/Hydrated Assets" as NextAssets
  }
}

node "Cloud Infrastructure (VPC)" {
  
  node "Web Server Node" <<Server>> {
    [Nginx Proxy] as Nginx
  }

  node "Application Node" <<Server>> {
    [NestJS Backend API] as BE
    [BullMQ Background Workers] as Workers
  }

  node "Data Storage Node" <<Server>> {
    database "PostgreSQL DB" as DB
    database "Redis Cache/Queue" as Redis
  }

  node "Execution Node Cluster" <<Server>> {
    node "Judge0 Engine" {
      [Judge0 API] as J0
      node "Docker Sandbox" {
        [Isolated Container] as Container
      }
    }
  }
}

' Kết nối
[NextAssets] -- Nginx : HTTPS / WSS
Nginx -- BE : Proxy Pass
BE -- DB : TypeORM (TCP/5432)
BE -- Redis : IORedis (TCP/6379)
Workers -- Redis : Pull Jobs
Workers -- J0 : HTTP Request
J0 -- Container : Spawn/Monitor

@enduml
```
