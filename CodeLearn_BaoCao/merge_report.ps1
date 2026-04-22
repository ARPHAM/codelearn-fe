# Script merge báo cáo CodeLearn chuẩn NEU sử dụng Pandoc
# Thứ tự kẹp file: Front Matter -> Intro/Ch1 -> Ch2 -> Ch3 -> Ch4 -> Conclusion/Appendices

$OutputFileName = "Bao_Cao_Khoa_Luan_Mergred.docx"

# Danh sách các file tham gia merge (theo đúng thứ tự quy định)
$Files = @(
    "metadata.yaml",
    "00_Front_Matter.md",
    "01_Intro_And_Chapter_1.md",
    "02_Chapter_2_Theory.md",
    "03_Chapter_3_Design.md",
    "04_Chapter_4_Results.md",
    "05_Conclusion_And_Back_Matter.md"
    # Nếu bạn có file Word riêng (ví dụ: Phụ lục mẫu), bạn có thể kẹp thêm vào đây:
    # "Phu_Luc_Mau.docx"
)

Write-Host "--- Đang bắt đầu quá trình Merge báo cáo ---" -ForegroundColor Cyan

# Kiểm tra xem Pandoc đã được cài đặt chưa
if (!(Get-Command pandoc -ErrorAction SilentlyContinue)) {
    Write-Host "LỖI: Pandoc chưa được cài đặt. Vui lòng cài đặt Pandoc để tiếp tục." -ForegroundColor Red
    exit
}

# Lệnh Pandoc thực hiện merge
# --reference-doc: Nếu bạn có 1 file Word mẫu đã chỉnh sẵn Font TNR 13 và Margins, hãy thêm tham số này
pandoc $Files -o $OutputFileName --toc --number-sections

if ($LASTEXITCODE -eq 0) {
    Write-Host "CHÚC MỪNG: Đã tạo file báo cáo thành công: $OutputFileName" -ForegroundColor Green
    Write-Host "Lưu ý: Bạn nên mở file word vừa tạo, Ctrl+A -> Chọn Font Times New Roman, Cỡ 13, Giãn dòng 1.3 để hoàn thiện 100%." -ForegroundColor Yellow
} else {
    Write-Host "LỖI: Có lỗi xảy ra trong quá trình merge." -ForegroundColor Red
}
