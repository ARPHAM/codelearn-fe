## 3.6. Biểu đồ lớp và ERD

### 3.6.1. Biểu đồ lớp phân hệ người dùng và lộ trình học
**Hình 3.49. Biểu đồ lớp phân hệ người dùng và lộ trình học**

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
  +role: RoleEnum
  +rating: Integer
  +xp: Integer
  --
  +hasRole(role: RoleEnum): Boolean
  +updateRating(delta: Integer): void
}

class UserSkillNode {
  +tag: String
  +progress: Float
  +status: String
  --
  +unlock(): void
  +updateProgress(value: Float): void
}

User "1" -- "0..*" UserSkillNode : owns
@enduml
```

### 3.6.2. Biểu đồ lớp phân hệ bài tập và quản lý phiên bản
**Hình 3.50. Biểu đồ lớp phân hệ bài tập và quản lý phiên bản**

```plantuml
@startuml CD_ProblemModule
skinparam monochrome true
!theme plain
skinparam classAttributeIconSize 0
title Biểu đồ Lớp: Phân hệ Bài tập và Quản lý phiên bản

class Problem {
  +id: UUID
  +title: String
  +difficulty: String
  +visibility: String
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
**Hình 3.51. Biểu đồ lớp phân hệ nộp bài và kết quả chấm**

```plantuml
@startuml CD_SubmissionModule
skinparam monochrome true
!theme plain
skinparam classAttributeIconSize 0
title Biểu đồ Lớp: Phân hệ Nộp bài và Kết quả chấm

class Submission {
  +status: String
  +score: Float
  +finalCode: Text
  --
  +isAccepted(): Boolean
}

class SubmissionResult {
  +status: String
  +stdout: Text
  +timeUsed: Integer
}

Submission "1" -- "0..*" SubmissionResult : has
@enduml
```

### 3.6.4. Biểu đồ lớp tổng thể hệ thống CodeLearn
**Hình 3.52. Biểu đồ lớp tổng thể hệ thống CodeLearn**

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
**Hình 3.53. Sơ đồ thực thể liên kết cơ sở dữ liệu**

```plantuml
@startuml ERD_CodeLearn
skinparam monochrome true
!theme plain
title Sơ đồ Thực thể Liên kết (ERD) - Database Schema

entity "users" {
  *id : uuid <<PK>>
  --
  email : varchar(255)
  password_hash : text
  role : enum
  rating : integer
  xp : integer
}

entity "problems" {
  *id : uuid <<PK>>
  --
  title : varchar(255)
  difficulty : enum
  author_id : uuid <<FK>>
}

entity "submissions" {
  *id : uuid <<PK>>
  --
  user_id : uuid <<FK>>
  problem_id : uuid <<FK>>
  status : varchar(20)
  score : float
}

users ||--o{ problems : "authors"
users ||--o{ submissions : "makes"
problems ||--o{ submissions : "receives"
@enduml
```

---

## 3.7. Biểu đồ trạng thái

### 3.7.1. Biểu đồ trạng thái vòng đời bài nộp
**Hình 3.54. Biểu đồ trạng thái vòng đời bài nộp**

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

---

## 3.8. Biểu đồ triển khai

### 3.8.1. Biểu đồ triển khai hệ thống CodeLearn
**Hình 3.58. Biểu đồ triển khai hệ thống CodeLearn**

```plantuml
@startuml DeploymentDiagram
skinparam monochrome true
!theme plain
title Biểu đồ Triển khai: Hệ thống CodeLearn

node "User PC" {
  [Browser]
}
node "Cloud Server" {
  [Backend API]
  [Database]
  [Judge0 Sandbox]
}
[Browser] --> [Backend API] : HTTPS
[Backend API] --> [Database] : TCP
[Backend API] --> [Judge0 Sandbox] : HTTP
@enduml
```
