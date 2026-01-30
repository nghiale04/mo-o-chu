# 🎩 Chiếc nón kỳ diệu: Tư tưởng Hồ Chí Minh về Đại đoàn kết

## 📖 Giới thiệu

Game "Mở ô chữ" về tư tưởng Hồ Chí Minh - Đại đoàn kết dân tộc. Trả lời câu hỏi để mở từng phần của từ khóa!

## 🎮 Cách chơi

### Gameplay

1. **10 từ khóa**: Mỗi từ khóa được chia thành 3 segment (phần)
2. **Click vào ô chữ**: Click vào bất kỳ ô nào của từ khóa chưa mở để hiện câu hỏi
3. **Trả lời câu hỏi**: Mỗi từ khóa có 3 câu hỏi, mỗi câu đúng mở 1 segment
4. **Điểm số**:
   - Trả lời đúng: +10 điểm
   - Trả lời sai: -2 điểm (không âm)
5. **Hoàn thành**: Mở đủ 3 segment = hoàn thành từ khóa

### Tính năng

- ✅ **Tự động lưu tiến độ**: Game tự động lưu vào localStorage
- ✅ **Chơi lại**: Reset toàn bộ game
- ✅ **Xóa lưu**: Xóa tiến độ đã lưu
- ✅ **Responsive**: Chơi được trên cả desktop và mobile
- ✅ **So khớp thông minh**: Không phân biệt hoa/thường, dấu tiếng Việt

## 🚀 Cách chạy

### Yêu cầu

- Trình duyệt web hiện đại (Chrome, Firefox, Edge, Safari)
- Không cần cài đặt gì thêm

### Chạy game

1. Mở file `index.html` bằng trình duyệt
2. Hoặc double-click vào file `index.html`
3. Game sẽ tự động chạy!

## 📁 Cấu trúc file

```
mo-o-chu/
├── index.html      # Giao diện chính + Tailwind CSS CDN
├── data.js         # Dữ liệu game (10 từ khóa + 30 câu hỏi)
├── app.js          # Logic game
└── README.md       # Hướng dẫn (file này)
```

## 🎨 Công nghệ sử dụng

- **HTML5**: Cấu trúc trang
- **Tailwind CSS**: Styling (CDN)
- **Vanilla JavaScript (ES6)**: Logic game
- **LocalStorage API**: Lưu tiến độ

## 🎯 Danh sách từ khóa

1. ĐẠI ĐOÀN KẾT
2. LIÊN MINH
3. SỨC MẠNH
4. THỜI ĐẠI
5. NỘI LỰC
6. HỮU NGHỊ
7. ĐA PHƯƠNG
8. ĐỒNG THUẬN
9. ĐỘC LẬP
10. TỰ DO

## 🔧 Tính năng kỹ thuật

### So khớp đáp án thông minh

- Không phân biệt hoa/thường
- Không phân biệt dấu tiếng Việt (normalize)
- Bỏ khoảng trắng thừa
- Ví dụ: "Đại đoàn kết" = "dai doan ket" = "ĐẠI ĐOÀN KẾT"

### Chia segment

- Từ khóa được chia thành 3 segment gần đều nhau
- Tính theo số ký tự (bỏ qua khoảng trắng khi chia)
- Hiển thị vẫn giữ nguyên khoảng trắng

### LocalStorage

Game tự động lưu:
- Điểm số
- Segment nào đã mở
- Tiến độ hoàn thành

## 🎨 Thiết kế UI

- **Glass-morphism**: Hiệu ứng kính mờ hiện đại
- **Gradient**: Màu sắc gradient đẹp mắt
- **Animation**: Hiệu ứng chuyển động mượt mà
- **Responsive**: Tự động điều chỉnh theo màn hình
- **Font**: Inter (Google Fonts)

## 🔄 Reset game

### Chơi lại
- Click nút "🔄 Chơi lại"
- Xác nhận trong popup
- Game reset về trạng thái ban đầu (giữ localStorage)

### Xóa lưu
- Click nút "🗑️ Xóa lưu"
- Xác nhận trong popup
- Xóa hoàn toàn localStorage và reset game

## 📱 Responsive

- **Desktop**: Hiển thị đầy đủ, ô chữ lớn
- **Tablet**: Tự động điều chỉnh kích thước
- **Mobile**: Tối ưu cho màn hình nhỏ, ô chữ vừa phải

## 🐛 Troubleshooting

### Game không lưu tiến độ?
- Kiểm tra trình duyệt có bật localStorage không
- Thử chế độ ẩn danh (Incognito) có thể chặn localStorage

### Ô chữ không hiển thị đúng?
- Đảm bảo font Inter đã load (cần internet)
- Refresh lại trang

### Modal không đóng?
- Click vào nút X hoặc click ra ngoài modal
- Refresh trang nếu bị lỗi

## 👨‍💻 Tác giả

Game được tạo cho môn **Tư tưởng Hồ Chí Minh** - Học kỳ 9

## 📄 License

Dự án này được tạo cho mục đích học tập.

---

**Chúc bạn chơi game vui vẻ và học tốt! 🎓**
