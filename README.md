# CodeLearn Frontend

Giao diện người dùng hiện đại và tương tác cao cho nền tảng học lập trình **CodeLearn**, được xây dựng bằng **Next.js**.

## 🚀 Giới thiệu

CodeLearn Frontend cung cấp trải nghiệm học tập mượt mà, từ việc làm bài tập lập trình với trình soạn thảo code tích hợp đến việc tham gia các trận đấu "Code Battle" kịch tính.

## ✨ Tính năng chính

- **Student Dashboard**: Theo dõi tiến độ học tập, lộ trình cá nhân hóa.
- **Code Editor**: Trình soạn thảo mã nguồn tích hợp (Monaco Editor) hỗ trợ highlight, tự động hoàn thành.
- **Real-time Code Battle**: Giao diện thi đấu đối kháng trực tiếp với người dùng khác.
- **Exam Environment**: Môi trường làm bài thi nghiêm ngặt với các tính năng chống gian lận.
- **Leaderboard**: Bảng xếp hạng toàn cầu và theo khóa học.
- **AI Assistant**: Tích hợp AI hỗ trợ giải đáp thắc mắc và gợi ý trong quá trình code.
- **Rich Text Content**: Hiển thị đề bài và bài giảng với Markdown và Tiptap editor.

## 🛠 Công nghệ sử dụng

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Real-time**: [Socket.io-client](https://socket.io/docs/v4/client-api/)

## 📋 Yêu cầu hệ thống

- Node.js (v20 trở lên)
- Backend CodeLearn đang chạy

## ⚙️ Cài đặt

1. Clone repository:
   ```bash
   git clone <repository-url>
   cd codelearn-fe
   ```

2. Cài đặt dependencies:
   ```bash
   npm install
   ```

3. Cấu hình biến môi trường:
   - Tạo file `.env` từ `.env.example`.
   - Cấu hình `NEXT_PUBLIC_API_URL` trỏ tới Backend API.

## 🚀 Chạy ứng dụng

```bash
# Chế độ phát triển
npm run dev

# Chế độ Production
npm run build
npm run start
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt để xem kết quả.

## 📁 Cấu trúc thư mục

- `app/`: Thư mục chính chứa các page và route (App Router).
- `components/`: Các thành phần UI dùng chung (Button, Input, Modal...).
- `features/`: Các module chức năng lớn (Battle, Editor, Dashboard...).
- `src/api`: Định nghĩa các hàm gọi API với Axios và TanStack Query.
- `src/hooks`: Các custom hooks dùng chung.
- `public/`: Các tài sản tĩnh như hình ảnh, fonts.

## 📄 License

Project này là tài sản riêng (Private).
