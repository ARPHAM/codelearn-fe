# Kiểm tra tổng thể biểu đồ — Audit kỹ FE + BE

## Tổng kết: Biểu đồ hiện có vs. Cần có

### ✅ Đã có (12 biểu đồ trong 03c)

| # | Biểu đồ | Loại | Trạng thái |
|:--|:---|:---:|:---|
| 1 | Đăng nhập | AD | ✅ Chính xác |
| 2 | Đăng nhập | SD | ✅ Chính xác |
| 3 | Nộp bài & Chấm điểm | AD | ✅ Chính xác |
| 4 | Nộp bài → /run → Polling | SD | ✅ Đã sửa |
| 5 | AI Mentor | AD | ✅ Chính xác |
| 6 | AI Mentor → /ai/chat | SD | ✅ Đã sửa |
| 7 | Phòng Cộng tác | AD | ✅ Chính xác |
| 8 | Phòng Cộng tác WebSocket | SD | ✅ Chính xác |
| 9 | Code Battle (Challenge/Accept) | AD | ✅ Đã sửa |
| 10 | Code Battle | SD | ✅ Đã sửa |
| 11 | Tổ chức Kỳ thi (Giảng viên) | AD | ✅ Chính xác |
| 12 | Tham gia Kỳ thi (Sinh viên) | SD | ✅ Đã sửa |

### ✅ Đã có (8 biểu đồ trong 03d)
- Class Diagram: User, Problem, Submission, Tổng thể
- Deployment Diagram
- Use Case chi tiết: Sinh viên, Giảng viên, Admin

### ✅ Đã có (2 biểu đồ trong 03b)
- Component Diagram (Kiến trúc)
- Use Case tổng quát

---

## ❌ Còn thiếu (phân tích từ source code thực tế)

### A. Luồng Đăng ký tài khoản (Register)
**Lý do:** Có route `/register` trong FE (`app/(auth)/register/`), API `/auth/register`
- **Thiếu:** AD_Register + SD_Register

### B. Luồng Tạo bài tập (Giảng viên)
**Lý do:** API `POST /problem`, `PUT /problem/{id}` rất phức tạp với `CreateProblemDto` (description blocks, testcases, problemFiles, workspaceConfig...)
- **Thiếu:** AD_CreateProblem + SD_CreateProblem

### C. Luồng Phê duyệt bài tập (Admin approve)
**Lý do:** Có `approveProblemVersion` (`PATCH /problem/admin/versions/{versionId}/approve`) và `rejectProblemVersion` — đây là quy trình duyệt bài độc đáo
- **Thiếu:** SD_ApproveProblem

### D. Luồng Đăng ký khóa học (Student enroll)
**Lý do:** API `POST /course/{courseId}/enroll` — sinh viên join course
- **Thiếu:** SD_CourseEnroll

### E. Luồng Kiểm tra Đạo văn (Plagiarism)
**Lý do:** API `POST /plagiarism/check/{exerciseId}` → `GET /plagiarism/{exerciseId}/results` → `POST /plagiarism/flag`
- **Thiếu:** SD_PlagiarismCheck

### F. Luồng Lộ trình học Skill Tree (Learning Path)
**Lý do:** API `GET /student/learning-path`, `POST /student/learning-path/refresh`, `GET /student/learning-path/suggestions` — đây là tính năng đặc trưng của CodeLearn
- **Thiếu:** SD_LearningPath

---

## Kết luận

| Tổng hiện có | Cần bổ sung | Tổng sau khi thêm |
|:---:|:---:|:---:|
| **22 biểu đồ** | **+8 biểu đồ** | **~30 biểu đồ** |

**Ưu tiên bổ sung (từ quan trọng → ít quan trọng):**
1. **AD + SD Tạo bài tập** — Quan trọng nhất (quy trình dài nhất của Giảng viên)
2. **SD Phê duyệt bài tập** — Unique feature của hệ thống
3. **AD + SD Đăng ký** — Bắt buộc (auth flow cơ bản)
4. **SD Learning Path** — Unique feature của CodeLearn (Skill Tree)
5. **SD Course Enroll** — Bổ trợ
6. **SD Plagiarism** — Bổ trợ
