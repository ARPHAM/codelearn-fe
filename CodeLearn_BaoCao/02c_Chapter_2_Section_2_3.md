## 2.3. Tổng quan và đánh giá các hệ thống liên quan

Việc phân tích các hệ thống OJ hiện có là bước không thể thiếu để xác định khoảng trống chức năng (feature gap) mà CodeLearn cần lấp đầy. Trong phần này, chúng tôi phân hệ thống thành hai nhóm chính: các nền tảng thương mại quy mô lớn và các hệ thống mã nguồn mở chuyên biệt, từ đó rút ra bài học và hướng phát triển riêng.

### 2.3.1. Các hệ thống thương mại và thi đấu

**A. LeetCode, Codeforces và HackerRank — Tiêu chuẩn de facto của luyện thi**

Các nền tảng như **Codeforces**, **LeetCode** và **HackerRank** đại diện cho chuẩn mực hiện tại của OJ trực tuyến. Hệ thống bảng xếp hạng (leaderboard), bộ sưu tập bài tập phong phú lên tới hàng chục nghìn đề bài, và cộng đồng người dùng đông đảo là những điểm mạnh không thể phủ nhận giúp các nền tảng này duy trì vị thế hàng đầu trong nhiều năm liên tiếp.

Tuy nhiên, đặt trong bối cảnh giáo dục đại học, những hệ thống này bộc lộ một số bất cập mang tính cấu trúc:

- **Mã nguồn đóng (Closed Source):** Nhà trường không thể tùy biến hệ thống, kiểm soát dữ liệu sinh viên hay tích hợp sâu vào hệ thống quản lý đào tạo nội bộ. Toàn bộ dữ liệu học tập (lịch sử bài nộp, tiến độ học tập) đều nằm trên máy chủ của bên thứ ba, gây ra lo ngại về bảo mật và quyền kiểm soát dữ liệu theo quy định của nhà trường.
- **Chi phí:** Các giải pháp dành cho doanh nghiệp và giáo dục của LeetCode hay HackerRank thường đi kèm mức chi phí rất cao, không phù hợp với ngân sách của hầu hết các trường đại học, đặc biệt là ở các nước đang phát triển.
- **Thiếu tính năng quản lý đào tạo (Pedagogical Management):** Các nền tảng này được xây dựng để phục vụ cá nhân tự học và tuyển dụng, không phải để quản lý lớp học. Chúng không có các tính năng như phân công bài tập cho lớp học cụ thể, theo dõi tiến độ từng sinh viên theo danh sách lớp, chấm điểm quá trình (process-based grading) hay phát hiện sao chép trong nội bộ lớp học. Đây là khoảng trống lớn nhất mà CodeLearn được thiết kế để lấp đầy.
- **Hạn chế trong kiểm soát gian lận nội bộ:** Mặc dù các nền tảng này sở hữu thuật toán phát hiện sao chép mã nguồn mạnh mẽ dựa trên cấu trúc logic, nhưng các tính năng giám sát thi cử nghiêm ngặt trong môi trường học thuật (theo dõi chuyển tab, khóa màn hình, giám sát webcam) thường chỉ có ở các gói doanh nghiệp với chi phí cao. Các phiên bản cộng đồng gần như không thể ngăn chặn sinh viên sử dụng tài liệu, AI hay các công cụ hỗ trợ thứ ba trong quá trình làm bài thi thực tế.
- **Định hướng sai về tư duy học tập:** Bản chất cạnh tranh và hướng đến phỏng vấn của LeetCode khuyến khích sinh viên ghi nhớ các "pattern" giải thuật hơn là xây dựng tư duy thuật toán từ nền tảng. Codeforces, với độ khó cao và thiên về toán học, phù hợp với lập trình thi đấu nhưng lại có thể gây nản lòng cho sinh viên trong các khóa học nhập môn đại học.

**B. Nhận xét tổng quan**

Tóm lại, các nền tảng thương mại nêu trên phù hợp nhất khi được sử dụng như công cụ luyện tập bổ sung (supplementary practice), không thể thay thế vai trò của một hệ thống quản lý thực hành lập trình chuyên biệt cho môi trường giáo dục có kiểm soát.

### 2.3.2. Các hệ thống OJ mã nguồn mở

**A. CMS (Contest Management System)**

CMS là hệ thống quản lý thi đấu mã nguồn mở, được thiết kế từ đầu để phục vụ các cuộc thi lập trình theo chuẩn IOI (International Olympiad in Informatics). Ưu điểm nổi bật của CMS là kiến trúc phân tán, khả năng mở rộng linh hoạt và mức độ bảo mật cao. Tuy nhiên, điểm yếu của hệ thống này nằm ở độ phức tạp của kiến trúc nguyên khối và yêu cầu hạ tầng. CMS được thiết kế như một giải pháp "trọn gói" với giao diện và cơ sở dữ liệu tích hợp chặt chẽ, rất khó để tách riêng phần chấm bài ra để tích hợp hoặc mở rộng. Đồng thời, việc cài đặt và cấu hình đòi hỏi nhiều công sức quản trị hệ thống chuyên sâu.

**B. DOMjudge**

DOMjudge là hệ thống quản lý thi đấu mã nguồn mở phổ biến nhất, được sử dụng rộng rãi trong các vòng thi ICPC khu vực và thế giới. Điểm mạnh của DOMjudge là tính ổn định cao, giao diện quản lý trực quan và cộng đồng hỗ trợ đông đảo. Tuy nhiên, tương tự CMS, kiến trúc của nó cũng theo hướng nguyên khối, được xây dựng bằng công nghệ cũ là PHP/Symfony. Hệ thống được tối ưu hóa cho mô hình "thi cố định thời gian với bộ đề cố định", thiếu linh hoạt cho việc tổ chức học tập liên tục (perpetual learning). Việc tùy biến sâu logic chấm bài hay xây dựng giao diện người dùng tách biệt đều gặp nhiều hạn chế do sự ràng buộc chặt chẽ với các thành phần nội bộ [23].

**C. Judge0 — Lớp thực thi lý tưởng cho CodeLearn**

Khác với CMS và DOMjudge vốn là các hệ thống thi đấu hoàn chỉnh, **Judge0** (Došilović và Mekterović, 2020) định vị mình là một "công cụ thực thi mã nguồn" (Code Execution Engine) thuần túy, được thiết kế theo kiến trúc API-first. Judge0 hỗ trợ hơn 60 ngôn ngữ lập trình, cung cấp kết quả thực thi chi tiết (stdout, stderr, exit code, thời gian chạy, bộ nhớ sử dụng) thông qua giao diện REST API chuẩn. Kiến trúc module hóa của nó là nền tảng lý thuyết cho quyết định thiết kế của CodeLearn: sử dụng một lõi thực thi (execution engine) tách biệt hoàn toàn khỏi lớp ứng dụng giáo dục, đảm bảo cả hai có thể phát triển và mở rộng độc lập.

### 2.3.3. Bảng so sánh tổng hợp và khoảng trống cần lấp đầy

Từ phân tích trên, chúng tôi xây dựng bảng so sánh tổng hợp các hệ thống theo các tiêu chí phù hợp với nhu cầu giáo dục đại học:

| Tiêu chí đánh giá | LeetCode | Codeforces | DOMjudge | Judge0 | **CodeLearn** |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Mã nguồn mở** | ✗ | ✗ | ✓ | ✓ | ✓ |
| **Quản lý lớp học** | ✗ | ✗ | Một phần | ✗ | ✓ |
| **AI Mentor tích hợp** | ✗ | ✗ | ✗ | ✗ | ✓ |
| **Web IDE đa tệp** | Cơ bản | ✗ | ✗ | ✗ | ✓ |
| **Lộ trình học (Skill Tree)** | ✗ | ✗ | ✗ | ✗ | ✓ |
| **Phòng cộng tác (Rooms)** | ✗ | ✗ | ✗ | ✗ | ✓ |
| **Thi đấu 1vs1** | ✗ | ✓ | ✗ | ✗ | ✓ |
| **Phân tích sao chép** | Cơ bản | Cơ bản | Một phần | ✗ | ✓ |
| **Kiểm soát chi phí** | Chi phí cao | Miễn phí | Miễn phí | Miễn phí | Tự quản lý |

### 2.3.4. Định vị của CodeLearn trong hệ sinh thái

Qua phân tích so sánh, CodeLearn không định vị mình là đối thủ cạnh tranh trực tiếp với LeetCode hay Codeforces về quy mô kho bài tập hay cộng đồng người dùng toàn cầu. Thay vào đó, CodeLearn hướng tới một phân khúc khác biệt: **Hệ thống Quản trị Thực hành Lập trình Tích hợp cho Giáo dục Đại học** (Integrated Programming Practice Management System for Higher Education — IPPM).

Đây là phân khúc mà không có bất kỳ hệ thống hiện hành nào đáp ứng đầy đủ. CodeLearn kết hợp: lõi thực thi mã nguồn an toàn (từ nguyên lý của Judge0), hệ sinh thái học tập có quản lý (từ nhu cầu thực tế của giảng viên), và lớp AI Mentor tích hợp (từ xu hướng EdTech 2025-2026). Sự tích hợp của ba yếu tố này trong một nền tảng thống nhất là điểm khác biệt chiến lược của dự án.

### 2.3.5. Bài học rút ra và định hướng thiết kế CodeLearn

Từ việc nghiên cứu các hệ thống trên, nhóm phát triển rút ra các bài học thiết kế cốt lõi:
1.  **Kiến trúc module hóa là bắt buộc:** Tránh kiến trúc nguyên khối như DOMjudge/CMS để đảm bảo khả năng mở rộng và tùy biến.
2.  **API-first là tiêu chuẩn:** Thiết kế theo mô hình REST API tách biệt giữa Frontend và Backend, cho phép tích hợp với các hệ thống ngoài trong tương lai.
3.  **Sandbox phải độc lập hoàn toàn:** Lớp thực thi mã nguồn phải được cô lập với lớp ứng dụng để đảm bảo bảo mật và cho phép mở rộng theo chiều ngang.
4.  **Trải nghiệm người dùng là yếu tố cạnh tranh:** Trong khi các OJ mã nguồn mở thường có giao diện thô sơ, CodeLearn đầu tư vào UX hiện đại để tạo ra môi trường học tập hấp dẫn và dễ tiếp cận.
