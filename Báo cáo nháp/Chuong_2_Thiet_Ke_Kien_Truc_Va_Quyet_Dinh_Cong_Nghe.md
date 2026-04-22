# PHẦN 2: THIẾT KẾ KIẾN TRÚC VÀ QUYẾT ĐỊNH CÔNG NGHỆ

Thay vì liệt kê các khái niệm lý thuyết về công cụ nền tảng, chương này sẽ tập trung lý giải nguyên nhân đằng sau các quyết định chọn lọc công nghệ (Technology Stack) và cách các thành phần này được kết nối để đáp ứng lượng tải công việc nặng, liên tục của hệ thống CodeLearn.

## 2.1. Bộ tiêu chí đánh giá và lựa chọn công nghệ

Để phục vụ một hệ thống EdTech có tính tương tác cao như bộ biên dịch và trình độ họa giao diện (UI) phức hợp, công nghệ được chọn không chỉ cần đáp ứng yêu cầu hiện tại mà còn phải đảm bảo tính co giãn (Scalability). Các tiêu chí cốt lõi bao gồm:

1. **Khả năng chiết xuất và kết xuất phía máy chủ (Server-Side Rendering - SSR):** Nhằm tối ưu hóa tốc độ tải trang bước đầu cho các bài giảng nặng và giảm thiểu độ trễ thao tác của sinh viên trên trình duyệt.
2. **Khả năng tích hợp sâu luồng I/O (Input/Output):** Backend phải xử lý được các tiến trình đọc, ghi và convert file liên tục (Markdown, Code file) mà không gây tắc nghẽn luồng xử lý chính.
3. **Quản lý state (trạng thái) phức hợp:** Giao diện Workspace của sinh viên yêu cầu sự đồng bộ giữa cây thư mục (File Explorer) và khung gõ mã (Code Editor) theo chu kỳ miligiây, đòi hỏi một thư viện UI có kiến trúc quản lý trạng thái luồng đơn (Uni-directional data flow) mạnh mẽ.

Với các tiêu chí đó, dự án đã chọn hệ sinh thái **React/Next.js** cho Frontend để tận dụng tối đa SSR cùng khả năng bóc tách Component, kết hợp với Backend chịu tải I/O tốt để vận hành logic lõi.

## 2.2. Thiết kế Kiến trúc Hệ thống Tổng thể

Cấu trúc CodeLearn được thiết kế theo dạng Client-Server Architecture mở rộng, phân tách rõ ràng trách nhiệm để dễ dàng bảo trì và nâng cấp.

<!-- [DÁN ẢNH SƠ ĐỒ HIỆN Ở ĐÂY] 
  (Copy mã code "1. Sơ đồ Kiến trúc Hệ thống Tổng thể" trong file 00_Ma_Nguon_So_Do.md bỏ vào mermaid.live, lưu ra file ảnh và dán vào đây) 
-->

**Kiến trúc được chia làm 4 phân hệ lõi (Subsystems):**
- **Client-Side (Trình bày giao diện):** Xử lý giao diện luồng Student Workspace (Khu vực gõ code), Lecturer Dashboard (Nơi quản lý giáo án) và Admin Portal (Quản lý User Complex). Nơi đây vận hành các xử lý kiểm soát sự kiện thao tác chuột và bàn phím của người dùng.
- **API-Gateway-Backend:** Đóng vai trò là cầu nối giao tiếp qua chuẩn RESTful, điều phối các Service cục bộ như xác thực (Auth), phân quyền, thao tác CSDL, và ghi nhận tiến độ nộp bài (Submission Processing).
- **Core-Engines (Trái tim kỹ thuật):** Phân hệ độc lập nhận nhiệm vụ "nặng" nhất bao gồm Engine Dịch tài liệu (Document Processor) và Engine trộn/giấu mã (Template Merging/Editor lock).
- **Database (Lưu trữ):** Chứa các cấu trúc quan hệ phức tạp giữa Khóa học, Bài tập và Dữ liệu chấm điểm.

## 2.3. Giải pháp Xử lý Dữ liệu và Kiểm soát Bảo mật (State & Security)

**a. Cơ chế Quản lý Không gian Trạng thái (State Management) & Theme Injection**
Một thách thức kỹ thuật lớn đã được giải quyết ở Frontend là hiện tượng *Hydration Mismatch* (Bất đồng bộ giao diện giữa Client và Server) khi áp dụng Theme Provider động (Light/Dark mode kết hợp cài đặt hệ thống) song song với trình Code Editor. 
* -> **Quyết định kỹ thuật:** Thay vì nhồi nhét state trực tiếp vào Component cha, hệ thống áp dụng các *pure rendering functions* (hàm render thuần) trong cơ chế trang trí Theme, trì hoãn (defer) việc tải các module nặng của Editor cho đến khi vòng đời Component `componentDidMount` (hoặc `useEffect` rỗng) chạy xong. Kỹ thuật này giúp loại bỏ triệt để cảnh báo lỗi chớp tắt màn hình của Next.js khi Build.

**b. Phân quyền và Bảo vệ tuyến (Role-Based Access Control - RBAC)**
Giải pháp bảo vệ tài nguyên API được thực thi chặt chẽ qua cơ chế kiểm tra Token và định danh (Role định tuyến).
* -> **Quyết định kỹ thuật:** Trong thiết kế cơ sở hạ tầng, tài khoản sinh viên được khóa kín quyền can thiệp vào các đường dẫn bắt đầu bằng `/admin/...`. Hơn thế, việc cập nhật Profile đặc thù của sinh viên (University, SĐT) được khoanh vùng qua cơ chế PATCH độc lập thay vì ghi đè (Overwrite) toàn bộ thông tin gốc, tránh lộ lọt các payload nhạy cảm.

## 2.4. Tích hợp Hệ công cụ lõi chuyên biệt (Core Engines)

Điểm nhấn tạo nên sự nguyên bản của CodeLearn so với các website thực hành khác nằm ở hai bộ Engine tự tinh chỉnh:

**a. Động cơ xuất báo cáo chuẩn học thuật (Pandoc & PrinceXML Engine)**
Các thư viện kết xuất PDF từ HTML thông thường (như jsPDF hay Puppeteer) thường dính lỗi vỡ layout, tràn trang hoặc không nhận diện tốt CSS phân mảnh. 
* -> **Phương án giải quyết:** Hệ thống đã lựa chọn một tổ hợp chuyên nghiệp: Sử dụng **Pandoc** làm parser (trình phân tách) biến đổi dữ liệu định dạng Markdown từ báo cáo của hệ thống sang HTML thô, tiếp sau đó sử dụng **PrinceXML** – một công cụ render CSS đỉnh cao dành riêng cho việc in ấn – để dệt lại HTML thô đó thành một tệp PDF/Word vô cùng sắc nét, hỗ trợ căn lề (Pagination), đánh số trang tự động và giữ nguyên bảng mã utf-8 của tiếng Việt.

**b. Kỹ thuật "Điền vào chỗ trống" (Editor Constraint Engine)**
Để phục vụ yêu cầu tạo các bài tập Boilerplate mà sinh viên không thể xóa nội dung mẫu, hệ thống thực thi cơ chế **Locking Range** (Khóa vùng).
* -> **Phương án giải quyết:** Thay vì gửi toàn bộ source tree mở từ Backend, hệ thống thiết lập một Workspace Controller. Giao diện nhận Metadata chỉ ra chính xác Dòng/Cột (Line/Column) nào trên File nội bộ được phép chỉnh sửa (`Read-only chunks`). Đồng thời, Frontend chặn thẳng các thao tác Xóa (Delete), Đổi tên (Rename) file gốc của bài phân tích. Sinh viên chỉ gửi phần dữ liệu "trả lời" về Backend, để Backend tiến hành *merge* (trộn) ngược lại vào template bí mật nằm trên server trước khi chấm điểm, chống mọi hành vi gian lận sửa Test-cases.
