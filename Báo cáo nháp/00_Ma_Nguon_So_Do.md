# DANH SÁCH MÃ CODE TẠO SƠ ĐỒ (MERMAID LAB)
*Hướng dẫn sử dụng: Bạn hãy copy từng khối mã (bắt đầu sau \`\`\`mermaid) bỏ vào trang web [https://mermaid.live/](https://mermaid.live/) để xuất ra hình ảnh chất lượng cao PNG/SVG và dán vào các phần chú thích trong Báo cáo.*

---

## 1. Sơ đồ Kiến trúc Hệ thống Tổng thể (Gắn vào mục 2.2)
```mermaid
graph TD
    subgraph Client-Side
        A[Next.js Frontend]
        A1(Student Workspace)
        A2(Lecturer Dashboard)
        A3(Admin Portal)
        A --- A1 & A2 & A3
    end

    subgraph API-Gateway-Backend
        B[Node/NestJS Backend API]
        B1(Auth & Roles Service)
        B2(Course & Workspace Service)
        B3(Submission Processing)
        B --- B1 & B2 & B3
    end

    subgraph Core-Engines
        C[Code Engine & File Processor]
        C1(Pandoc & PrinceXML)
        C2(Template Merging / Editor)
    end

    subgraph Database
        D[(PostgreSQL / MongoDB)]
    end

    A <-->|RESTful / JSON| B
    B <--> C
    B <-->|ORM| D
```

---

## 2. Biểu đồ Use-case Tổng quát (Gắn vào mục 3.1)
```mermaid
flowchart LR
    Student((Sinh viên))
    Lecturer((Giảng viên))
    Admin((Quản trị viên))

    subgraph CodeLearn System
        UC1(Đăng nhập / Đăng ký)
        UC2(Làm bài tập Code Editor)
        UC3(Nộp bài chuẩn form)
        UC4(Cấu hình Template bài tập)
        UC5(Quản lý lộ trình học)
        UC6(Xuất Report PDF/Docx)
        UC7(Quản lý toàn bộ hệ thống)
        UC8(Quản lý Onboarding User)
    end

    Student ---> UC1
    Student ---> UC2
    Student ---> UC3

    Lecturer ---> UC1
    Lecturer ---> UC4
    Lecturer ---> UC5
    Lecturer ---> UC6

    Admin ---> UC1
    Admin ---> UC7
    Admin ---> UC8
```

---

## 3. Biểu đồ Tuần tự quá trình Onboarding Sinh viên (Gắn vào mục 3.2 - Nhóm 1)
```mermaid
sequenceDiagram
    actor Admin
    participant Frontend as CodeLearn Portal
    participant Backend as Auth API
    participant Email as Email Service
    actor Student

    Admin->>Frontend: Upload file CSV danh sách Sinh viên
    Frontend->>Backend: POST /admin/users/import
    Backend-->>Backend: Xử lý và lưu thành "Pending Users"
    Backend->>Email: Trigger Gửi mail kích hoạt + Temp Auth
    Email->>Student: Nhận Email chứa Token kích hoạt
    Student->>Frontend: Bấm Link kích hoạt, điền Profile mới
    Frontend->>Backend: PATCH /users/activate (with Token)
    Backend-->>Backend: Cập nhật Role và Status -> "Active"
    Backend-->>Frontend: Trả về Token Đăng nhập chính thức
    Frontend->>Student: Hiển thị Dashboard Thành công
```

---

## 4. Dòng chảy Tạo bài tập Điền vào chỗ trống (Gắn vào mục 3.2 - Nhóm 2)
```mermaid
flowchart TD
    A([Bắt đầu tạo bài tập]) --> B[Điền thông tin môn học]
    B --> C{Chọn loại bài tập?}
    C -->|Tự luận| D[Thiết lập mô tả]
    C -->|Điền vào chỗ trống| E[Khởi tạo Boilerplate Code]
    E --> F[Đánh dấu vùng khóa Editor Constraint]
    F --> G[Cấu hình Input/Output mong muốn]
    G --> H[Phân quyền không cho xoá/đổi tên file gốc]
    D --> I[Lưu vào Database]
    H --> I
    I --> J([Kết thúc: Sinh viên có thể bắt đầu làm])
```

---

## 5. Cấu trúc Database ERD hạt nhân (Gắn vào mục 3.3)
```mermaid
erDiagram
    USERS ||--o{ ENROLLMENTS : registers
    USERS ||--o{ SUBMISSIONS : submits
    COURSES ||--o{ EXERCISES : contains
    EXERCISES ||--o{ SUBMISSIONS : belongs_to
    ENROLLMENTS }|--|| COURSES : enrolled_in

    USERS {
        uuid id PK
        string email
        string role "Admin, Lecturer, Student"
        string profile_stats
    }
    COURSES {
        uuid id PK
        string title
        string description
    }
    EXERCISES {
        uuid id PK
        uuid courseId FK
        string exercise_type "Fill_Blank / Standard"
        json boilerplate_code
    }
    SUBMISSIONS {
        uuid id PK
        uuid studentId FK
        uuid exerciseId FK
        string final_code
        float grade
    }
```
