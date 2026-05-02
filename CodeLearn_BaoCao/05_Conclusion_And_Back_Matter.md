# KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

### 1. Kết quả đạt được

Sau quá trình nghiên cứu và triển khai, đề tài **"Xây dựng nền tảng học tập lập trình trực tuyến CodeLearn"** đã hoàn thành các mục tiêu đề ra:
- **Hạ tầng kỹ thuật & Backend:** Xây dựng thành công hệ thống dựa trên kiến trúc Multi-tier bền vững. Hoàn thiện công nghệ **Docker Sandbox** để thực thi mã nguồn an toàn, hệ thống hàng đợi **BullMQ** giúp điều phối bài nộp, và các thuật toán **xử lý dữ liệu đồ thị** để quản lý sự phụ thuộc trong lộ trình học tập (Skill Tree).
- **Trải nghiệm & Tương tác người dùng:** Triển khai giao diện Web-IDE chuyên nghiệp kết hợp với **Socket.io Server** phía Backend để duy trì trạng thái thời gian thực cho tính năng thi đấu Code Battle 1v1 và các phòng học cộng tác.
- **Tích hợp Trí tuệ nhân tạo:** Hiện thực hóa trợ lý AI Mentor thông qua việc kết hợp **Gemini API** [3] với kiến trúc **RAG (Retrieval-Augmented Generation)** [12] phía Backend, đảm bảo phản hồi luôn bám sát ngữ cảnh đề bài và giữ vững phương pháp sư phạm Socratic.

### 2. Những hạn chế của đề tài

Mặc dù đạt được nhiều kết quả khả quan, dự án vẫn còn một số điểm cần tiếp tục hoàn thiện:
- **Tài nguyên Sandbox:** Trong quá trình thực nghiệm tại Chương 4, việc khởi chạy mỗi container Judge0 tiêu tốn trung bình khoảng 50MB - 100MB RAM. Khi số lượng người dùng đồng thời cực lớn, hệ thống cần cơ chế Auto-scaling linh hoạt hơn trên các nền tảng như Kubernetes.
- **Độ chính xác của AI:** AI Mentor đôi khi vẫn gặp hiện tượng "ảo giác" nhẹ trong các bài tập có cấu trúc dữ liệu cực kỳ phức tạp. Cần tiếp tục tinh chỉnh Prompt và mở rộng kho tri thức Vector DB.
- **Hỗ trợ đa ngôn ngữ:** Hiện tại hệ thống hoạt động tốt nhất với C++ và Java. Việc hỗ trợ các ngôn ngữ có môi trường phức tạp như C# (.NET) hay các thư viện AI nặng của Python vẫn cần tối ưu hóa Docker Image.

### 3. Lộ trình nâng cấp và Mở rộng

Hệ thống có lộ trình phát triển rõ ràng để trở thành một sản phẩm EdTech hoàn thiện:
- **Giai đoạn 1 (Ngắn hạn):** Tích hợp VS Code Web IDE để hỗ trợ các dự án đa tệp tin và bổ sung hệ thống Gamification (Huy hiệu, Bảng xếp hạng tuần).
- **Giai đoạn 2 (Trung hạn):** Phát triển tính năng "Phòng học thông minh" cho phép giảng viên quan sát trực tiếp màn hình code của toàn bộ lớp học thời gian thực qua WebSocket.
- **Giai đoạn 3 (Dài hạn):** Đóng gói hệ thống dưới dạng SaaS (Software as a Service) để triển khai cho nhiều trường đại học và trung tâm đào tạo trên cùng một hạ tầng.

### 4. Kết luận chung

Đề tài đã hiện thực hóa một môi trường học tập lập trình hiện đại, giải quyết được bài toán về sự thiếu hụt tương tác và khó khăn trong thực hành trực tuyến. Những kiến thức và kinh nghiệm thu được từ đồ án này là nền tảng quan trọng để phát triển các ứng dụng giáo dục thông minh trong tương lai. Em xin chân thành cảm ơn ThS. Nguyễn Hùng Việt hướng dẫn và hội đồng đã giúp đỡ em hoàn thành đồ án này.

---

# PHỤ LỤC

### Phụ lục A: Đặc tả kỹ thuật triển khai CodeLearn

#### A.1. Cấu hình Backend (NestJS Framework)
Hệ thống Backend được xây dựng trên nền tảng **Node.js** với Framework **NestJS**, sử dụng **TypeScript** làm ngôn ngữ chủ đạo.
- **Quản lý dữ liệu:** Sử dụng **TypeORM** kết hợp cơ sở dữ liệu **PostgreSQL**. Toàn bộ cấu trúc bảng (Schema) được quản lý qua các tệp tin Entity, đảm bảo tính đồng bộ tuyệt đối giữa mã nguồn và cơ sở dữ liệu.
- **Xử lý bất đồng bộ:** Tích hợp **BullMQ** [21] và **Redis** để quản lý hàng đợi chấm bài. Khi sinh viên nộp bài, yêu cầu sẽ được đẩy vào hàng đợi và xử lý bởi các Worker, giúp Backend không bị chặn (non-blocking) và có thể tiếp nhận hàng nghìn yêu cầu cùng lúc.
- **Xác thực và Bảo mật:** Sử dụng **Passport.js** và **JWT** để quản lý phiên đăng nhập. Mật khẩu người dùng được mã hóa bằng thuật toán **Bcrypt** trước khi lưu trữ.

#### A.2. Công cụ thực thi và Chấm điểm (Judge0)
Hệ thống chấm bài dựa trên engine **Judge0** [13] chạy trong môi trường **Docker** [4]:
- **Cơ chế cô lập:** Mỗi lượt nộp bài được thực thi trong một container Sandbox biệt lập, giới hạn về thời gian (Time Limit) và bộ nhớ (Memory Limit) để ngăn chặn các mã nguồn độc hại làm ảnh hưởng đến máy chủ.
- **Giao tiếp:** Backend kết nối với Judge0 qua các REST API endpoint, hỗ trợ cả cơ chế đồng bộ (cho "Run Code") và bất đồng bộ qua Webhook (cho "Submit Code").

#### A.3. Giao diện và Tương tác (Frontend)
- **Framework:** Sử dụng **Next.js 14** (App Router) để tối ưu hóa tốc độ tải trang và SEO.
- **Real-time:** Tích hợp **Socket.io** để cập nhật trạng thái chấm bài và duy trì kết nối trong các phòng học cộng tác/đối kháng.
- **Trình soạn thảo:** Sử dụng **Monaco Editor** với cấu hình tùy biến cao, hỗ trợ gợi ý mã nguồn và tô màu cú pháp đa ngôn ngữ.

### Phụ lục B: Danh mục biến môi trường hệ thống (Environment Variables)

Hệ thống yêu cầu các cấu hình sau để vận hành đồng bộ giữa hai phân hệ:

#### B.1. Cấu hình Backend (.env)
```bash
# App Configuration
PORT=4000
API_PREFIX=api/v1

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=********
DB_NAME=codelearn-db

# Security & JWT
JWT_SECRET=dev_secret_key
JWT_EXPIRES_IN=1h

# Message Queue (Redis & BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
BULL_QUEUE_NAME=submission-queue

# AI Integration
GOOGLE_GENERATIVE_AI_API_KEY=[YOUR_GEMINI_KEY]

# CORS & Client Integration
CORS_ORIGINS=http://localhost:3000
```

#### B.2. Cấu hình Frontend (.env.local)
```bash
# API Connection
NEXT_PUBLIC_API_ENDPOINT=http://localhost:4000/api/v1
NEXT_PUBLIC_API_URL=http://localhost:4000

# Authentication Providers
NEXT_PUBLIC_GOOGLE_CLIENT_ID=********.apps.googleusercontent.com
```

### Phụ lục C: Prompt cấu hình cho AI Mentor
Để AI Mentor giữ vững vai trò sư phạm, hệ thống sử dụng System Prompt sau:
> "Bạn là **CodeLearn AI Mentor** — một chuyên gia giáo dục lập trình thông minh. Nhiệm vụ của bạn là dẫn dắt sinh viên vượt qua các rào cản về tư duy thay vì cung cấp lời giải có sẵn.
> 
> **Quy tắc sư phạm (Socratic Method):**
> 1. **Không giải bài:** Tuyệt đối không cung cấp mã nguồn hoàn chỉnh hoặc sửa trực tiếp vào code của sinh viên.
> 2. **Gợi mở tư duy:** Khi sinh viên gặp lỗi (Runtime/Logic), hãy phân tích luồng dữ liệu và đặt các câu hỏi định hướng (ví dụ: 'Điều gì xảy ra nếu biến n bằng 0 ở dòng này?') để sinh viên tự phát hiện vấn đề.
> 3. **Giải thích khái niệm:** Tập trung giải thích bản chất của thuật toán và cấu trúc dữ liệu liên quan.
> 4. **Phong cách:** Chuyên nghiệp, kiên nhẫn và luôn khích lệ tinh thần tự học.
> 
> **Ngữ cảnh hiện tại:** [Đề bài] + [Mã nguồn sinh viên] + [Thông báo lỗi từ Sandbox]. Hãy dựa vào dữ liệu này để đưa ra chỉ dẫn sát thực nhất."
