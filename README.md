# DopiSery - Bộ công cụ văn phòng & xử lý tài liệu trực tuyến 100% Client-Side

Ứng dụng web xử lý tài liệu (PDF, Word, Excel, QR, Text) chạy hoàn toàn trên trình duyệt người dùng, bảo mật và riêng tư 100%.

---

## Hướng dẫn triển khai lên GitHub Pages (Đảm bảo 100% hoạt động)

Dự án đã được tích hợp sẵn 2 cơ chế triển khai tự động, bạn có thể chọn bất kỳ cách nào:

### Cách 1: Triển khai từ nhánh với thư mục `/docs` (Khuyên dùng - Đơn giản nhất, không cần đợi Action build)
1. Thư mục `docs/` đã được build sẵn toàn bộ mã nguồn tĩnh kèm file `.nojekyll` và `404.html`.
2. Trên GitHub, vào kho lưu trữ của bạn -> chọn **Settings** -> **Pages** (cột bên trái).
3. Tại phần **Build and deployment**:
   * **Source**: Chọn `Deploy from a branch`
   * **Branch**: Chọn `main` (hoặc `master`) và chọn thư mục `/docs` (thay vì `/ (root)`).
   * Nhấn **Save**.
4. Chờ 30 giây, trang web của bạn sẽ hoạt động hoàn hảo tại `https://<username>.github.io/<repo-name>/`.

---

### Cách 2: Triển khai tự động bằng GitHub Actions
1. File `.github/workflows/deploy.yml` đã được tối ưu sẵn với `npm install --legacy-peer-deps`.
2. Trên GitHub, vào **Settings** -> **Pages**:
   * **Source**: Chọn `GitHub Actions`.
3. Vào tab **Actions** trên GitHub -> chọn workflow **Deploy to GitHub Pages** -> nhấn **Run workflow**.
4. GitHub sẽ tự động build và xuất bản trang web.

---

## Chạy dự án cục bộ (Local Development)

```bash
# Cài đặt thư viện
npm install --legacy-peer-deps

# Chạy môi trường phát triển
npm run dev

# Build sản phẩm (tự động cập nhật dist/ và docs/)
npm run build
```
