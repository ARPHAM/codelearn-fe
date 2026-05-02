# Biểu đồ Hoạt động — XML nguồn cho Draw.io (Trắng đen)

## Cách sử dụng
1. Mở https://app.diagrams.net (Draw.io)
2. Chọn **Extras → Edit Diagram** (hoặc `Ctrl+Shift+X`)
3. **Xóa toàn bộ** nội dung cũ, dán XML tương ứng vào
4. Nhấn **OK** → Biểu đồ xuất hiện ngay
5. Export: **File → Export As → PNG** (chọn DPI = 150 hoặc 300)

---

## Hình 3.1 — Biểu đồ Hoạt động: Đăng nhập

```xml
<mxGraphModel>
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />

    <!-- Swim Lane Container -->
    <mxCell id="2" value="Đăng nhập" style="shape=pool;startSize=30;horizontal=1;childLayout=stackLayout;horizontalStack=1;resizeParent=1;collapsible=0;fillColor=#ffffff;strokeColor=#000000;fontStyle=1;" vertex="1" parent="1">
      <mxGeometry x="20" y="20" width="780" height="880" as="geometry" />
    </mxCell>

    <!-- Lane 1: Người dùng -->
    <mxCell id="3" value="Người dùng" style="swimlane;startSize=30;fillColor=#ffffff;strokeColor=#000000;fontStyle=1;" vertex="1" parent="2">
      <mxGeometry x="0" y="0" width="260" height="880" as="geometry" />
    </mxCell>

    <!-- Lane 2: Hệ thống CodeLearn -->
    <mxCell id="4" value="Hệ thống CodeLearn" style="swimlane;startSize=30;fillColor=#ffffff;strokeColor=#000000;fontStyle=1;" vertex="1" parent="2">
      <mxGeometry x="260" y="0" width="260" height="880" as="geometry" />
    </mxCell>

    <!-- Lane 3: Database -->
    <mxCell id="5" value="Cơ sở dữ liệu (PostgreSQL)" style="swimlane;startSize=30;fillColor=#ffffff;strokeColor=#000000;fontStyle=1;" vertex="1" parent="2">
      <mxGeometry x="520" y="0" width="260" height="880" as="geometry" />
    </mxCell>

    <!-- START node -->
    <mxCell id="10" value="" style="ellipse;fillColor=#000000;strokeColor=#000000;" vertex="1" parent="3">
      <mxGeometry x="115" y="50" width="25" height="25" as="geometry" />
    </mxCell>

    <!-- A1: Bấm Đăng nhập -->
    <mxCell id="11" value="Bấm &quot;Đăng nhập&quot;" style="rounded=1;arcSize=10;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="3">
      <mxGeometry x="60" y="100" width="140" height="35" as="geometry" />
    </mxCell>

    <!-- A2: Nhập Email -->
    <mxCell id="12" value="Nhập Email và Mật khẩu" style="rounded=1;arcSize=10;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="3">
      <mxGeometry x="60" y="160" width="140" height="35" as="geometry" />
    </mxCell>

    <!-- A3: Nhấn xác nhận -->
    <mxCell id="13" value="Nhấn nút xác nhận" style="rounded=1;arcSize=10;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="3">
      <mxGeometry x="60" y="220" width="140" height="35" as="geometry" />
    </mxCell>

    <!-- B1: Kiểm tra định dạng -->
    <mxCell id="20" value="Kiểm tra định dạng đầu vào" style="rounded=1;arcSize=10;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="4">
      <mxGeometry x="50" y="280" width="165" height="35" as="geometry" />
    </mxCell>

    <!-- B2: Diamond Hợp lệ? -->
    <mxCell id="21" value="Đầu vào hợp lệ?" style="rhombus;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="4">
      <mxGeometry x="70" y="340" width="125" height="55" as="geometry" />
    </mxCell>

    <!-- A_err: Hiển thị lỗi định dạng -->
    <mxCell id="22" value="Hiển thị lỗi định dạng" style="rounded=1;arcSize=10;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="3">
      <mxGeometry x="60" y="355" width="140" height="35" as="geometry" />
    </mxCell>

    <!-- END 1 -->
    <mxCell id="23e" value="" style="ellipse;fillColor=#000000;strokeColor=#000000;double=1;" vertex="1" parent="3">
      <mxGeometry x="115" y="415" width="25" height="25" as="geometry" />
    </mxCell>

    <!-- B3: Gửi request -->
    <mxCell id="23" value="Gửi POST /auth/login" style="rounded=1;arcSize=10;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="4">
      <mxGeometry x="50" y="420" width="165" height="35" as="geometry" />
    </mxCell>

    <!-- C1: Tra cứu email -->
    <mxCell id="30" value="Tra cứu email trong CSDL" style="rounded=1;arcSize=10;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="5">
      <mxGeometry x="45" y="420" width="170" height="35" as="geometry" />
    </mxCell>

    <!-- B4: Email tồn tại? -->
    <mxCell id="31" value="Email tồn tại?" style="rhombus;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="4">
      <mxGeometry x="70" y="480" width="125" height="55" as="geometry" />
    </mxCell>

    <!-- B_err2: Lỗi tài khoản -->
    <mxCell id="32" value="Lỗi: Tài khoản không tồn tại" style="rounded=1;arcSize=10;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="4">
      <mxGeometry x="35" y="560" width="195" height="35" as="geometry" />
    </mxCell>

    <!-- END 2 -->
    <mxCell id="32e" value="" style="ellipse;fillColor=#000000;strokeColor=#000000;double=1;" vertex="1" parent="4">
      <mxGeometry x="120" y="615" width="25" height="25" as="geometry" />
    </mxCell>

    <!-- C2: So khớp mật khẩu -->
    <mxCell id="33" value="So khớp mật khẩu (bcrypt)" style="rounded=1;arcSize=10;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="5">
      <mxGeometry x="45" y="490" width="170" height="35" as="geometry" />
    </mxCell>

    <!-- B5: Mật khẩu khớp? -->
    <mxCell id="34" value="Mật khẩu khớp?" style="rhombus;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="4">
      <mxGeometry x="70" y="660" width="125" height="55" as="geometry" />
    </mxCell>

    <!-- B_err3: Lỗi mật khẩu -->
    <mxCell id="35" value="Lỗi: Mật khẩu không đúng" style="rounded=1;arcSize=10;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="4">
      <mxGeometry x="35" y="740" width="195" height="35" as="geometry" />
    </mxCell>

    <!-- END 3 -->
    <mxCell id="35e" value="" style="ellipse;fillColor=#000000;strokeColor=#000000;double=1;" vertex="1" parent="4">
      <mxGeometry x="120" y="795" width="25" height="25" as="geometry" />
    </mxCell>

    <!-- B6: Tạo JWT -->
    <mxCell id="36" value="Tạo Access Token (JWT 15 phút)&#xa;Tạo Refresh Token (JWT 7 ngày)" style="rounded=1;arcSize=10;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="4">
      <mxGeometry x="35" y="740" width="195" height="45" as="geometry" />
    </mxCell>

    <!-- C3: Cập nhật lastLoginAt -->
    <mxCell id="37" value="Cập nhật lastLoginAt" style="rounded=1;arcSize=10;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="5">
      <mxGeometry x="45" y="750" width="170" height="35" as="geometry" />
    </mxCell>

    <!-- A4: Nhận token -->
    <mxCell id="40" value="Nhận token, điều hướng Dashboard" style="rounded=1;arcSize=10;fillColor=#ffffff;strokeColor=#000000;" vertex="1" parent="3">
      <mxGeometry x="50" y="810" width="165" height="35" as="geometry" />
    </mxCell>

    <!-- END FINAL -->
    <mxCell id="41" value="" style="ellipse;fillColor=#000000;strokeColor=#000000;double=1;" vertex="1" parent="3">
      <mxGeometry x="115" y="860" width="25" height="25" as="geometry" />
    </mxCell>

  </root>
</mxGraphModel>
```

> **Sau khi import:** Kéo thêm mũi tên nối các node theo luồng. Gán nhãn "Có"/"Không" cho các nhánh từ hình thoi.

---

## Hướng dẫn style thống nhất khi vẽ thủ công

Để tất cả biểu đồ trắng đen đồng nhất như tiền bối, áp dụng quy tắc sau trong Draw.io:

| Thành phần | Shape style trong Draw.io | Ghi chú |
|:---|:---|:---|
| Tiêu đề swimlane | `shape=pool` | Thanh tiêu đề trên cùng |
| Cột (lane) | `swimlane` | Mỗi actor một cột |
| Hoạt động (activity) | `rounded=1;arcSize=10;fillColor=#ffffff;strokeColor=#000000;` | **Hình chữ nhật bo góc nhẹ** — KHÔNG dùng arcSize=50 |
| Điều kiện (if/else) | `rhombus;fillColor=#ffffff;strokeColor=#000000;` | Hình thoi |
| Start ● | `ellipse;fillColor=#000000;strokeColor=#000000;` | Hình tròn đặc |
| End ◉ | `ellipse;fillColor=#000000;strokeColor=#000000;double=1;` | Hình tròn kép |
| Mũi tên | Kéo từ cạnh shape | Gán nhãn "Có"/"Không" cho nhánh điều kiện |

**Shortcut trong Draw.io:**
- Chọn tất cả → `Ctrl+A` → Right panel → Format → Fill: White, Line: Black
- Hoặc: Edit → Select All → Format → chọn màu

---

## Danh sách Activity Diagram cần vẽ trong Draw.io

| # | Tên biểu đồ | Các cột (Swim Lanes) |
|:--|:---|:---|
| 1 | Đăng nhập | Người dùng \| Hệ thống \| CSDL |
| 2 | Nộp bài & Chấm điểm | Sinh viên \| Hệ thống \| Judge0 |
| 3 | AI Mentor | Sinh viên \| Hệ thống \| Gemini API |
| 4 | Phòng cộng tác | Sinh viên A \| Hệ thống \| Sinh viên B |
| 5 | Code Battle 1v1 | Sinh viên A \| Hệ thống \| Sinh viên B |
| 6 | Tổ chức kỳ thi | Giảng viên \| Hệ thống |
| 7 | Tạo bài tập | Giảng viên \| Hệ thống \| Judge0 |
