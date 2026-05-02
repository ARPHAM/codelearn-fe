# CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ TỔNG QUAN HỆ THỐNG LIÊN QUAN

## 2.1. Lịch sử phát triển và Xu hướng đánh giá lập trình tự động

Sự phát triển của các hệ thống đánh giá lập trình tự động (Automated Programming Assessment - APA) là một minh chứng điển hình cho sự giao thoa giữa khoa học máy tính và khoa học giáo dục. Trong hơn sáu thập kỷ, APA đã chuyển mình từ những công cụ kiểm tra cú pháp đơn giản thành những hệ thống trí tuệ nhân tạo có khả năng phân tích ngữ nghĩa và tư duy sư phạm. Hành trình này không chỉ là sự tiến bộ về mặt công nghệ thuần túy, mà còn là sự chuyển dịch sâu sắc trong triết lý giáo dục: từ mô hình lấy giảng viên làm trung tâm (Teacher-centered) sang mô hình lấy người học làm trung tâm (Student-centered), nơi phản hồi tức thì và cá nhân hóa đóng vai trò then chốt. Tính đến giữa năm 2026, lĩnh vực này đã bước vào kỷ nguyên "AI-Native Education", nơi ranh giới giữa máy chấm bài và người thầy đang dần trở nên mờ nhạt.

### 2.1.1. Các phương pháp giảng dạy và đánh giá truyền thống (Giai đoạn tiền tự động hóa)

Trong những thập kỷ đầu của giáo dục khoa học máy tính (1950 - 1980), việc đánh giá năng lực lập trình là một quy trình thủ công cực kỳ tốn kém và chậm chạp.

**A. Nỗ lực tự động hóa đầu tiên và những giới hạn lịch sử**

Lịch sử của APA bắt đầu từ năm 1961 tại Đại học Stanford với hệ thống hỗ trợ chấm điểm cho ngôn ngữ ALGOL 60 [3]. Đây là lần đầu tiên con người cố gắng giảm bớt gánh nặng đánh giá thủ công bằng phương tiện điện tử. Tuy nhiên, do hạn chế về hạ tầng phần cứng, sinh viên thời bấy giờ vẫn phải ghi mã nguồn lên các thẻ đục lỗ (punched cards) và nộp theo từng mẻ (batch processing). Một lỗi cú pháp nhỏ nhất cũng có thể tiêu tốn hàng giờ chờ đợi trong hàng đợi biên dịch, tạo ra một vòng lặp học tập cực kỳ chậm chạp và gây nản lòng người học. Trong suốt phần lớn thế kỷ 20, phương pháp chấm bài thủ công (Manual Grading) vẫn chiếm ưu thế tại hầu hết các cơ sở giáo dục do sự thiếu hụt về tài nguyên tính toán và cơ sở hạ tầng mạng.

**B. Những rào cản mang tính hệ thống của phương pháp Manual Grading**

Dưới góc độ tâm lý học giáo dục, mô hình chấm bài thủ công không chỉ tốn kém về thời gian mà còn bộc lộ những khiếm khuyết mang tính cấu trúc, làm cản trở sự phát triển tư duy của sinh viên:

1.  **Gánh nặng nhận thức và sự đứt gãy phản hồi (Cognitive Discontinuity):** Theo thuyết gánh nặng nhận thức của Sweller (Cognitive Load Theory), "vòng lặp phản hồi" lý tưởng cho việc học lập trình phải diễn ra trong vòng vài giây để thông tin lỗi sai còn nằm trong "bộ nhớ làm việc" (Working Memory). Tuy nhiên, phương pháp thủ công thường kéo dài phản hồi từ vài ngày đến hàng tuần. Đến khi sinh viên nhận được bài chấm, họ đã không còn nhớ rõ luồng tư duy tại thời điểm viết mã, khiến việc phân tích và sửa lỗi trở nên kém hiệu quả nghiêm trọng.

2.  **Sự thiếu nhất quán trong đánh giá (Inter-rater Reliability):** Con người dễ bị ảnh hưởng bởi các yếu tố ngoại lai như sự mệt mỏi, thiên kiến cá nhân về phong cách lập trình (coding style preferences), hoặc sự không thống nhất trong tiêu chí chấm điểm giữa các giảng viên khác nhau. Những yếu tố chủ quan này dẫn đến sự bất công trong đánh giá mà người học không thể kiểm soát được.

3.  **Giới hạn về độ bao phủ kiểm thử (Test Coverage):** Một giảng viên con người khó có thể chạy thử hàng trăm bài nộp với các bộ dữ liệu khổng lồ để kiểm tra các trường hợp biên (edge cases), giới hạn về thời gian thực thi (Time Limit Exceeded) hoặc tràn bộ nhớ (Memory Limit Exceeded). Điều này dẫn đến việc sinh viên có thể "lách luật" với các thuật toán có độ phức tạp cao nhưng vẫn chạy đúng với dữ liệu mẫu nhỏ, làm giảm độ chính xác và hiệu quả trong việc đánh giá năng lực thực chất.

### 2.1.2. Sự trỗi dậy và phân hóa của các thế hệ Online Judge (OJ)

Nhu cầu khắc phục các hạn chế trên đã thúc đẩy sự ra đời của các hệ thống Online Judge. Quá trình này được phân chia thành ba thế hệ kiến trúc rõ rệt:

| Thế hệ | Giai đoạn | Công nghệ đặc trưng | Đại diện tiêu biểu | Triết lý cốt lõi |
| :--- | :--- | :--- | :--- | :--- |
| **Thế hệ 1** | 1990 - 2005 | Mạng LAN, Shell Scripting | PC², UVa OJ | Tự động hóa việc nộp và chấm điểm |
| **Thế hệ 2** | 2005 - 2022 | Web 2.0, Container, Sandbox | Codeforces, LeetCode, SPOJ | Khả năng mở rộng và an ninh hệ thống |
| **Thế hệ 3** | 2023 - Nay | LLMs, RAG, Semantic Analysis | CodeLearn, Khanmigo | Cá nhân hóa và hỗ trợ sư phạm thông minh |

**A. Thế hệ 1: Các hệ thống quản lý kỳ thi cục bộ (LAN-based OJ)**

Đại diện tiêu biểu nhất cho giai đoạn này là **PC² (Programming Contest Control System)**, được phát triển tại Đại học California State [8]. Trong suốt thập niên 90 và đầu những năm 2000, PC² là tiêu chuẩn vàng cho các kỳ thi lập trình sinh viên quốc tế (ACM-ICPC). PC² hoạt động dựa trên mô hình máy trạm - máy chủ trong mạng nội bộ (LAN). Mặc dù đã giải quyết được bài toán tự động hóa chấm điểm thời gian thực, nhưng kiến trúc này bộc lộ sự cứng nhắc đáng kể:
- **Phụ thuộc vào môi trường:** Yêu cầu cài đặt phần mềm phức tạp trên từng máy trạm, cấu hình tường lửa và mạng LAN nghiêm ngặt.
- **Thiếu tính linh hoạt:** Khó khăn trong việc hỗ trợ truy cập từ xa qua internet hoặc triển khai cho các lớp học phân tán.
- **Giao diện người dùng lỗi thời:** Thiếu tính tương tác và trực quan so với tiêu chuẩn phần mềm hiện đại.

**B. Thế hệ 2: Sự bùng nổ của các hệ thống dựa trên nền tảng Website**

Sự phổ biến của Internet đã mở ra kỷ nguyên của các OJ dựa trên nền tảng Web. Một trong những đại diện đầu tiên của xu thế này là **UVa Online Judge** xuất hiện tại Đại học Valladolid, Tây Ban Nha (1995) [9]. Hệ thống này cho phép người dùng toàn cầu nộp bài qua giao diện web và nhận kết quả qua email, tạo một kho lưu trữ bài toán khổng lồ đầu tiên trên thế giới. Tiếp nối là các hệ thống như SPOJ (Sphere Online Judge), POJ (Peking University) và thế hệ hiện đại như **Codeforces, LeetCode, HackerRank**. Điểm chung của các hệ thống này là khả năng tiếp cận với mọi người mọi lúc, cộng đồng lớn mạnh và kho bài tập phong phú.

Về mặt kỹ thuật, giai đoạn này đánh dấu sự chuyển dịch từ việc chạy các kịch bản thực thi đơn giản sang sử dụng các **kỹ thuật cô lập tiên tiến (Sandboxing)** dựa trên các cơ chế của nhân Linux như:
- **Namespaces:** Cô lập tài nguyên hệ thống bao gồm Network, Mount, PID, giúp các tiến trình không thể can thiệp lẫn nhau.
- **Control Groups (Cgroups):** Giới hạn tài nguyên phần cứng (CPU, RAM), ngăn chặn các cuộc tấn công Fork Bomb hay chiếm dụng toàn bộ tài nguyên máy chủ.
- **Seccomp (Secure Computing Mode):** Hạn chế các lời gọi hệ thống (system calls) nguy hiểm như `fork()`, `exec()` hay truy cập hệ thống tệp tin trái phép.

**C. Thế hệ 3: Kỷ nguyên AI-Native và Đánh giá dựa trên Ngữ nghĩa (Từ 2023)**

Từ năm 2023, sự bùng nổ của các mô hình ngôn ngữ lớn (LLM) như GPT-4 và Gemini đã mở ra giai đoạn thứ ba: Đánh giá dựa trên quá trình và ngữ nghĩa (Semantic Evaluation). Thay vì coi mã nguồn là một "hộp đen" (Black-box) chỉ quan tâm đến Input/Output, các hệ thống thế hệ thứ 3 như CodeLearn tập trung vào **White-box Testing** kết hợp **Semantic Analysis**:

- **Vượt qua giới hạn của Testcase cứng nhắc:** AI có thể phát hiện các lỗi logic tinh vi mà testcase thông thường không thể bắt được, ví dụ như lỗi tiềm ẩn về rò rỉ bộ nhớ (memory leak) hay cấu trúc dữ liệu chưa tối ưu.
- **Độ chính xác vượt trội trong đánh giá:** Các nghiên cứu thực nghiệm năm 2025 (Bernik et al.) trên 315 bài nộp Python cho thấy AI có khả năng đánh giá với hệ số tương quan Pearson đạt 0.91 so với điểm số của giảng viên chuyên môn [11]. Điều này khẳng định các LLM có thể đóng vai trò "người chấm sơ loại" đáng tin cậy, giúp giảm tải đáng kể cho đội ngũ giảng viên.
- **Sự khác biệt về "Triết lý chấm điểm" giữa các dòng mô hình:** Nghiên cứu của Jukiewicz (2025) lưu ý rằng các mô hình lớn như GPT-4o thường có xu hướng "phóng khoáng" (generous), ưu tiên ý tưởng sáng tạo hơn sự hoàn chỉnh của cú pháp, trong khi các mô hình chuyên biệt nhỏ hơn như GPT-4.1-nano thường khắt khe hơn cả giảng viên con người trong việc bắt lỗi định dạng và quy chuẩn mã nguồn [12].
- **Tính đến tháng 4/2026**, các chuẩn đánh giá như HumanEval đã được thay thế bởi các benchmark thực tế hơn như **SWE-bench Verified** (kiểm tra khả năng giải quyết lỗi thực tế trong các kho mã nguồn phức tạp) và **LiveCodeBench** (kiểm tra thuật toán trên bài toán chưa từng xuất hiện trong dữ liệu huấn luyện). Các mô hình hàng đầu như Gemini 3.1 Pro đã đạt ngưỡng **80%** trên SWE-bench Verified [10].

### 2.1.3. Các xu hướng giáo dục lập trình hiện đại và Cơ sở học thuật

Việc xây dựng CodeLearn không chỉ dựa trên công nghệ mà còn dựa vững chắc trên các học thuyết giáo dục hiện đại và các bằng chứng thực nghiệm mới nhất:

**A. Bằng chứng thực nghiệm về Hiệu quả của AI Tutor (2025-2026)**

Một bản phân tích tổng hợp (meta-analysis) của 87 nghiên cứu độc lập công bố vào cuối năm 2025 đã cung cấp những con số thuyết phục về tác động của AI Tutor trong giáo dục CNTT [1]:
- **Nâng cao thành tích học tập:** Sinh viên sử dụng trợ lý AI đạt điểm số trung bình cao hơn **12.4%** so với nhóm học truyền thống. Một số nghiên cứu chuyên biệt về lập trình ghi nhận mức tăng trưởng từ **15% đến 35%** về khả năng làm chủ kiến thức [2].
- **Giảm tỷ lệ thất bại học tập:** Việc tích hợp AI Tutor giúp giảm **25% tỷ lệ rớt môn** và **15% tỷ lệ sinh viên bỏ học** trong các khóa học lập trình nhập môn — những khóa học thường có tỷ lệ rớt cao nhất trong chương trình CNTT [1].
- **Tối ưu hóa thời gian hoàn thành bài tập:** Sinh viên sử dụng AI Mentor hoàn thành bài tập trong thời gian trung bình **49 phút**, so với **60 phút** ở các lớp học thông thường, tương ứng với mức tăng hiệu suất **18.3%** [4].
- **Tăng mức độ gắn kết (Engagement):** Một số nghiên cứu chỉ ra rằng sinh viên tương tác với AI Tutor có mức độ gắn kết cao hơn **40% đến 60%** so với các hình thức giảng dạy truyền thống, đặc biệt là đối với các bài tập lập trình phức tạp [4].

**B. Thang đo Bloom và việc đánh giá tự động**

Hệ thống APA truyền thống thường chỉ đánh giá được hai cấp độ thấp nhất trong **Thang đo Bloom** (Bloom's Taxonomy): **"Ghi nhớ" (Remember)** và **"Hiểu" (Understand)** — kiểm tra xem sinh viên có viết ra được cú pháp đúng không. Tuy nhiên, CodeLearn hướng tới việc đánh giá và hỗ trợ sinh viên ở các cấp độ cao hơn:
- **"Vận dụng" (Apply):** Kiểm tra khả năng áp dụng thuật toán đã học vào bài toán mới.
- **"Phân tích" (Analyze):** Thông qua phản hồi AI về độ phức tạp thuật toán và cấu trúc mã nguồn.
- **"Đánh giá" (Evaluate):** Khuyến khích sinh viên tự nhìn nhận trade-off giữa các cách tiếp cận khác nhau.

**C. Vùng phát triển gần của Vygotsky và vai trò của AI Mentor**

Theo tâm lý học phát triển của Lev Vygotsky, mỗi người học đều có một "Vùng phát triển gần" (Zone of Proximal Development - ZPD) — khoảng cách giữa những gì họ có thể làm độc lập và những gì họ có thể đạt được với sự trợ giúp phù hợp. CodeMentor trong hệ thống CodeLearn đóng vai trò là "người hướng dẫn có năng lực cao hơn" (More Knowledgeable Other - MKO), cung cấp các gợi ý (Scaffolding) vừa đủ để giúp sinh viên tự mình vượt qua khó khăn, mà không làm thay bài — từ đó giúp sinh viên thực sự tiến bộ vào trong vùng ZPD của mình.

**D. Phương pháp Socratic tích hợp AI và sự ngăn chặn gian lận chủ động**

Khan Academy với dự án **Khanmigo** đã tiên phong trong việc chuyển đổi AI từ vai trò "người giải bài" sang "người hướng dẫn Socratic". CodeLearn áp dụng triết lý tương tự bằng cách thiết kế các **System Prompts** đa tầng cho Gemini API. Thay vì trả lời câu hỏi "Tại sao code của em lỗi?", AI sẽ đặt ngược lại các câu hỏi định hướng: "Hãy nhìn vào điều kiện dừng của vòng lặp ở dòng này, điều gì xảy ra nếu mảng đầu vào rỗng?" Phương pháp này ngăn chặn hiệu quả việc "gian lận thụ động" và buộc sinh viên phải tham gia vào quá trình tư duy phản biện. Nghiên cứu thực nghiệm cho thấy quy trình đánh giá AI hai lớp (Unit Test + AI Analysis) đạt độ chính xác **63%** trong việc cung cấp gợi ý sửa lỗi hoàn toàn chính xác [18].

**E. Giải quyết bài toán "Ảo giác AI" bằng kiến trúc RAG**

Mặc dù mạnh mẽ, các LLM vẫn đối mặt với tỷ lệ "ảo giác" (hallucination) khoảng **37%** trong các giải thích kỹ thuật phức tạp khi hoạt động ở chế độ Zero-shot (không có ngữ cảnh) [7]. Vấn đề này đặc biệt nghiêm trọng trong giáo dục, vì một lời giải thích sai về thuật toán có thể hình thành nhận thức sai lầm kéo dài ở người học. CodeLearn giải quyết triệt để vấn đề này bằng kiến trúc **RAG (Retrieval-Augmented Generation)** kết hợp với **Vector Database**:

1.  **Giai đoạn Indexing (Lập chỉ mục):** Toàn bộ giáo trình, tài liệu kỹ thuật chuẩn và các bộ testcase của từng bài toán được chuyển đổi thành các Vector nhúng (Embeddings) và lưu trữ trong cơ sở dữ liệu vector.
2.  **Giai đoạn Retrieval (Truy xuất):** Khi sinh viên đặt câu hỏi, hệ thống thực hiện tìm kiếm ngữ nghĩa (Semantic Search) để truy xuất các đoạn tri thức liên quan nhất từ kho kiến thức đã được xác thực.
3.  **Giai đoạn Generation (Tạo sinh):** AI chỉ được phép trả lời dựa trên bối cảnh (Context) đã được truy xuất và xác thực. Điều này đảm bảo phản hồi luôn chính xác về mặt kỹ thuật, phù hợp với nội dung môn học, và không chứa các thông tin bịa đặt.

Kiến trúc RAG kết hợp với **Prompt Engineering hai lớp** (một lớp prompt tĩnh định nghĩa vai trò sư phạm của AI, và một lớp prompt động chứa nội dung bài học cụ thể) [19] chính là nền tảng đảm bảo tính tin cậy của CodeMentor trong hệ thống CodeLearn.
