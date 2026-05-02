## 2.2. Cơ sở lý thuyết về kỹ thuật xây dựng hệ thống

Phần này trình bày các nền tảng lý thuyết và kỹ thuật cốt lõi mà hệ thống CodeLearn được xây dựng dựa trên, bao gồm quy trình thực thi mã nguồn, kiến trúc đa lớp của một Online Judge hiện đại và các kỹ thuật cô lập bảo mật.

### 2.2.1. Nguyên lý hoạt động của quá trình thực thi mã nguồn

Mọi hệ thống OJ về bản chất đều là một hệ thống đánh giá dựa trên đầu vào – đầu ra (Input/Output Verification). Sinh viên nộp mã nguồn, hệ thống biên dịch và thực thi, rồi so khớp kết quả với đáp án mẫu. Tuy nhiên, đằng sau sự đơn giản bề ngoài đó là một chuỗi quy trình kỹ thuật phức tạp diễn ra chỉ trong vài trăm mili-giây.

**A. Giai đoạn biên dịch (Compilation)**

Đối với các ngôn ngữ biên dịch như C, C++, Go, mã nguồn được trình biên dịch (compiler) chuyển đổi thành tệp tin nhị phân (binary executable). Quá trình này bao gồm bốn bước tuần tự: phân tích từ vựng (lexical analysis), phân tích cú pháp (syntax/parse analysis), phân tích ngữ nghĩa (semantic analysis) và sinh mã (code generation). Hệ thống OJ cần bắt giữ luồng lỗi chuẩn (stderr) từ trình biên dịch để trả về thông báo "Compilation Error" có ý nghĩa và chính xác cho người dùng.

Đối với các ngôn ngữ thông dịch (interpreted) như Python hay JavaScript, giai đoạn biên dịch truyền thống được thay thế bằng giai đoạn phân tích cú pháp và tạo bytecode trước khi đưa vào máy ảo thực thi (Virtual Machine). Cả hai luồng xử lý này đều phải được hệ thống OJ hỗ trợ đồng nhất và minh bạch đối với người dùng.

**B. Giai đoạn thực thi (Execution) và các nguy cơ tiềm ẩn**

Giai đoạn thực thi là giai đoạn rủi ro nhất và quan trọng nhất đối với an toàn bảo mật của hệ thống. Mã nguồn được nạp vào bộ nhớ và thực thi bởi CPU trong một không gian tiến trình (process). Tại giai đoạn này, hệ thống phải đối mặt với toàn bộ các hành vi không xác định từ mã nguồn người dùng, bao gồm: vòng lặp vô hạn (infinite loop), truy cập bộ nhớ trái phép (illegal memory access), tạo một lượng lớn tiến trình con (process forking) hay thậm chí là các cuộc tấn công leo thang đặc quyền (privilege escalation). Hệ thống phải áp dụng các giới hạn tài nguyên cứng nhắc để đảm bảo chương trình luôn kết thúc, giải phóng tài nguyên và không gây ra bất kỳ ảnh hưởng nào đến môi trường hệ thống bên ngoài.

**C. Giai đoạn so khớp kết quả (Output Verification)**

Sau khi thực thi, đầu ra của chương trình (stdout) được đọc và so khớp byte-by-byte với đáp án mẫu. Đây tưởng chừng là bước đơn giản nhưng lại chứa đựng nhiều sắc thái kỹ thuật quan trọng. Hầu hết các OJ hiện đại sử dụng phương pháp so khớp "token-based" hoặc áp dụng bộ chuẩn hóa (normalizer) để bỏ qua sự khác biệt về dấu trắng cuối dòng hay ký tự xuống hàng (CRLF vs LF), tránh gây ra kết quả "Wrong Answer" oan sai do các lỗi định dạng không đáng kể.

### 2.2.2. Mô hình phân lớp của hệ sinh thái OJ hiện đại

Nghiên cứu của Došilović và Mekterović (2020) trong bài báo giới thiệu **Judge0** tại hội nghị MIPRO 2020 đã đề xuất một mô hình kiến trúc module hóa, tách biệt rõ ràng trách nhiệm từng thành phần [13]. Đây là cơ sở lý thuyết quan trọng để thiết kế hệ thống CodeLearn theo hướng microservices hiện đại, thay vì nguyên khối (monolithic). Mô hình này phân tách hệ thống thành các lớp chức năng độc lập:

**A. Lớp Giao diện và Nghiệp vụ (Application Layer)**

Đây là lớp trực tiếp tương tác với người dùng cuối thông qua giao diện Web. Lớp này bao gồm toàn bộ giao diện người dùng (Frontend) và logic nghiệp vụ giáo dục như quản lý bài tập, quản lý lớp học, hệ thống thi cử và bảng xếp hạng. Trong kiến trúc của CodeLearn, lớp này được xây dựng bằng **Next.js** và giao tiếp với các lớp dưới thông qua REST API và WebSocket.

**B. Lớp Hệ thống thực thi mã trực tuyến (OCES Layer)**

Lớp hệ thống thực thi mã trực tuyến (OCES - Online Code Execution System) đóng vai trò điều phối trung gian, nhận yêu cầu từ lớp ứng dụng và phân phối chúng đến các máy chấm. Đây là thành phần REST API chính của hệ thống (trong CodeLearn được xây dựng bằng **NestJS**), chịu trách nhiệm xác thực, xếp hàng đợi (queuing) và cân bằng tải (load balancing). Nhiệm vụ chính của lớp này là đưa yêu cầu thực thi vào hàng đợi thông điệp (Message Queue), điều phối và cân bằng tải tới các máy chấm, đồng thời lưu trữ và trả về kết quả cho lớp ứng dụng.

**C. Lớp Lõi thực thi (Code Execution Engine - CEE)**

Lớp lõi thực thi (CEE) là tập hợp các "công nhân" (workers) chịu trách nhiệm thực thi mã nguồn. Mỗi worker là một tiến trình độc lập, liên tục lấy công việc (job) từ hàng đợi, chuẩn bị môi trường cô lập, gọi đến trình biên dịch, thực thi mã nguồn bên trong Sandbox và thu thập số liệu kết quả như thời gian chạy và bộ nhớ sử dụng. Kiến trúc worker-based này cho phép hệ thống mở rộng theo chiều ngang (horizontal scaling) một cách dễ dàng bằng cách thêm các worker node mới mà không cần thay đổi bất kỳ thành phần nào khác của hệ thống.

**D. Lớp Sandbox (Cô lập và Bảo mật)**

Lớp Sandbox hay còn gọi là "hộp cô lập" là lớp thấp nhất và quan trọng nhất về an toàn bảo mật. Đây là lớp trực tiếp cung cấp môi trường bị cô lập hoàn toàn với môi trường máy chủ vật lý để thực thi các đoạn mã không đáng tin cậy từ người dùng. Việc tách lớp Sandbox ra khỏi nền tảng ứng dụng giúp hệ thống có thể tối ưu hóa bảo mật và hiệu năng độc lập với nhau, đồng thời nếu một sandbox bị tấn công, kẻ tấn công chỉ bị giới hạn trong một "hộp kín" dùng một lần, không thể truy cập vào máy chủ vật lý hay gây ảnh hưởng đến các sandbox khác [16].

### 2.2.3. Kỹ thuật ảo hóa và cô lập môi trường (Sandboxing)

Sandboxing là kỹ thuật tạo ra một môi trường thực thi kiểm soát chặt chẽ, hạn chế quyền truy cập của tiến trình đối với tài nguyên hệ thống máy chủ vật lý. Đây là yếu tố bảo mật không thể thỏa hiệp đối với bất kỳ hệ thống OJ nào.

**A. So sánh các phương pháp Sandboxing**

Hiện nay, việc xây dựng môi trường thực thi an toàn thường được tiếp cận theo ba hướng chính, mỗi hướng có những ưu nhược điểm riêng phù hợp với từng ngữ cảnh sử dụng:

| Đặc điểm | Máy ảo (VM) | Docker Container | Linux Isolate/Native |
| :--- | :--- | :--- | :--- |
| **Kiến trúc** | Ảo hoá phần cứng, chạy Guest OS riêng biệt | Ảo hoá cấp OS, chia sẻ kernel với máy chủ | Sử dụng trực tiếp tính năng Kernel, không qua Daemon |
| **Mức độ cô lập** | Rất cao, kernel hoàn toàn riêng biệt | Trung bình, chia sẻ kernel tiềm ẩn rủi ro leo thang đặc quyền | Cao, được thiết kế chuyên biệt cho OJ |
| **Thời gian khởi động** | Rất chậm (vài giây đến phút) | Nhanh (mili-giây đến giây) | Cực nhanh (mili-giây) |
| **Tài nguyên sử dụng** | Cao, cần RAM và CPU cho Guest OS | Thấp, chia sẻ kernel với host | Rất thấp, overhead gần bằng 0 |
| **Đánh giá cho OJ** | Không phù hợp cho quy mô lớn | Khả thi nhưng cần cấu hình bảo mật cẩn thận | Tối ưu nhất về hiệu năng |

Dựa trên các benchmark thực nghiệm năm 2024, Docker container chạy trên Linux native cho thấy chi phí tính toán (compute overhead) chỉ khoảng **0.12%** so với thực thi gốc, một con số hoàn toàn không đáng kể trong thực tế. Thời gian tạo Linux namespace (thao tác cốt lõi của container) chỉ mất khoảng **8-10 mili-giây** [14], khiến Docker trở thành lựa chọn cân bằng giữa bảo mật và hiệu năng cho các hệ thống OJ quy mô vừa và lớn.

**B. Cơ chế hoạt động của Isolate**

Isolate là một công cụ sandbox chuyên dụng được phát triển bởi Martin Mareš và Bernard Blackham, được sử dụng trong CMS (Contest Management System) cho kỳ thi Olympic tin học quốc tế (IOI) [15]. Điểm khác biệt lớn nhất của Isolate so với Docker là nó không sử dụng Docker engine, mà tương tác trực tiếp với Linux kernel để tạo ra các sandbox siêu nhẹ thông qua hai cơ chế chính:

**Cơ chế 1: Linux Namespaces (Không gian tên)**
Linux Namespaces cung cấp sự cô lập về mặt "tầm nhìn" cho tiến trình, khiến nó không thể nhìn thấy hay tác động đến các tiến trình khác của hệ thống:
- **PID Namespace:** Tiến trình trong sandbox thấy mình có PID = 1, không thể nhìn thấy hay tác động đến các tiến trình khác của hệ thống bên ngoài.
- **Mount Namespace:** Tạo ra một hệ thống tệp tin riêng biệt. Isolate thường mount thư mục gốc ở chế độ chỉ đọc và chỉ cho phép ghi vào thư mục tạm thời được kiểm soát, ngăn chặn việc xóa hay thay đổi file hệ thống.
- **Network Namespace:** Cô lập ngăn xếp mạng. Trong các kỳ thi, kết nối mạng thường bị vô hiệu hóa hoàn toàn để ngăn chặn gian lận hoặc tấn công ra bên ngoài.

**Cơ chế 2: Control Groups - Cgroups**
Cgroups là cơ chế của nhân Linux cho phép giới hạn và đo lường tài nguyên phần cứng mà một nhóm tiến trình có thể sử dụng:
- **Memory Cgroup:** Đặt giới hạn cứng cho RAM. Nếu tiến trình vượt quá, Kernel sẽ kích hoạt Out-Of-Memory Killer (OOM Killer) để dừng tiến trình ngay lập tức, trả về trạng thái "Memory Limit Exceeded".
- **CPU Cgroup:** Giới hạn thời gian sử dụng CPU và gán tiến trình vào các lõi cụ thể để đảm bảo kết quả đo đạc thời gian là chính xác và nhất quán, tránh bị ảnh hưởng bởi các tác vụ nền của hệ thống.
- **PIDs Cgroup:** Giới hạn số lượng tiến trình con tối đa có thể được tạo ra. Kể từ Linux kernel 4.3, cơ chế `pids.max` cho phép thiết lập giới hạn cứng (hard limit) trực tiếp trên hệ thống tệp cgroup (`/sys/fs/cgroup/`). Đây là vũ khí quan trọng nhất để ngăn chặn tấn công Fork Bomb [16].

**C. Các nguy cơ bảo mật và phương án phòng chống**

Việc thực thi mã nguồn không tin cậy luôn đi kèm với các rủi ro bảo mật nghiêm trọng. Dưới đây là các vector tấn công phổ biến nhất và cách Isolate/Docker đối phó:

- **Fork Bomb:** Một chương trình đệ quy tự nhân bản, có thể làm cạn kiệt bảng tiến trình của hệ điều hành, gây treo máy chủ. Isolate ngăn chặn điều này bằng PIDs Cgroup, đặt ra một số lượng tiến trình tối đa cho sandbox (ví dụ: `pids.max = 64`). Khi đạt giới hạn, mọi lời gọi `fork()` hay `clone()` tiếp theo sẽ trả về lỗi `-EAGAIN` thay vì tạo tiến trình mới.
- **Vòng lặp vô hạn:** Làm tiêu tốn CPU vô hạn. Isolate sử dụng bộ đếm thời gian (wall-clock timer) của hệ điều hành để gửi tín hiệu `SIGKILL` khi hết thời gian cho phép.
- **Truy cập tệp hệ thống trái phép:** Đọc hoặc gây tác động lên các tệp tin hệ thống nhạy cảm như `/etc/passwd`. Cơ chế Mount Namespace ngăn chặn điều này bằng cách "giam lỏng" tiến trình trong một thư mục tạm thời ảo, không thể truy cập ra ngoài.
- **Tấn công mạng:** Gửi dữ liệu ra internet hoặc tương tác với các máy chủ bên ngoài để gian lận. Network Namespace với cấu hình `CLONE_NEWNET` vô hiệu hóa hoàn toàn giao tiếp mạng, giải quyết triệt để vấn đề này.
