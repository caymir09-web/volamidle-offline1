# Võ Lâm Idle — Bản chạy OFFLINE

Bản sao đầy đủ mã nguồn + dữ liệu của https://volamidle.pages.dev/ , sắp xếp lại để chạy được mà không cần Internet.

## 🚀 Cách chạy (khuyến nghị)

**Cách 1 — Chạy bằng server cục bộ (đầy đủ nhất: có nhạc, hiệu ứng âm thanh):**

```
Bấm đúp vào file: start.bat
```

Trình duyệt sẽ tự mở `http://localhost:8765/` và game chạy hoàn toàn offline.
Đóng cửa sổ PowerShell hoặc nhấn `Ctrl+C` trong cửa sổ đó để dừng server.

**Đưa game lên Cloudflare Pages:** upload toàn bộ nội dung thư mục `volamidle-offline`,
giữ nguyên các thư mục con như `js/`, `fonts/`, `img/`, `fx/`, `music/`, `snd/` và `ui/`.
Sau khi deploy, trang chủ tự mở `index.html`. Có thể thử
`/js/core.js` và `/fonts/ibm-plex-mono.css`: hai URL này phải trả về mã nguồn,
không phải trang HTML. `404.html` giúp Pages báo tệp deploy thiếu thay vì trả nhầm
`index.html` cho yêu cầu tệp tĩnh.

**Đưa game lên GitHub Pages:** đưa nội dung thư mục này vào thư mục publish của Pages,
không để nguyên một thư mục game lồng bên trong nếu chọn repository root làm thư mục publish.
Các tài nguyên dùng đường dẫn tương đối nên hoạt động cả ở URL project dạng
`https://<user>.github.io/<repository>/`; `.nojekyll` yêu cầu GitHub phục vụ nguyên trạng
các file tĩnh. Sau khi bật Pages, kiểm tra `<địa chỉ-pages>/js/core.js` phải hiện mã JavaScript.

** Cách 2 — Chạy trực tiếp không cần server:**

Bấm đúp `index.html`. Game vẫn chạy bình thường, nhưng **âm thanh hiệu ứng (SFX) có thể bị tắt**
do trình duyệt chặn `fetch()` trên `file://` (nhạc nền vẫn phát).

> Lần đầu vào game: chọn phe → đặt tên nhân vật → bắt đầu hành tẩu.

## 🗂 Cấu trúc thư mục

| Đường dẫn | Nội dung |
|---|---|
| `index.html` | Trang chính của game |
| `start.bat`, `server.ps1` | Khởi chạy server cục bộ |
| `*.js` (gốc) | Dữ liệu lớn: `data.js` (kỹ năng/quái/trang bị), `world.js` (bản đồ), `sound.js`, `fx*.js`, `jxlook.js`… |
| `js/` | Logic game: chiến đấu, lò rèn, nhiệm vụ, ngựa, phó bản, giao diện… |
| `*.css` (gốc) | Giao diện: `style.css`, `jx1ui.css`, `jx1ui2.css`, `ui20.css` |
| `fonts/` | Font IBM Plex Mono (offline) |
| `img/a/` | Hoạt ảnh quái & nhân vật (webp) |
| `img/jx/` | Nhân vật ghép theo trang bị (mũ, áo, vũ khí, ngựa) |
| `img/s/`, `img/i/` | Icon kỹ năng, icon vật phẩm |
| `img/z/` | Ảnh nền bản đồ / phó bản |
| `img/u2/`, `img/ep/`, `img/m/`, `img/p/`, `img/pl/` | Icon giao diện, đá ép đồ, quái, icon khác |
| `fx/` | Hiệu ứng chiêu thức & trạng thái (webp) |
| `music/`, `snd/` | Nhạc nền theo bản đồ, âm thanh quái/ui |
| `sw.js` | Service worker (chỉ dùng khi chạy qua http) |

## ✅ Chạy offline được những gì

- Toàn bộ gameplay: luyện công, lên cấp, kỹ năng, lò rèn, nhiệm vụ, phó bản, ngựa, kỳ trân các, kho chung…
- Hoàng Kim: các bộ có dữ liệu hợp lệ nằm trong pool rơi; hệ số rơi mặc định đã trở về công thức gốc và có thể chỉnh trong bảng GM (`100%` = gốc). Cấp yêu cầu trang bị là cấp 1.
- Giao diện đầy đủ, quái/nhân vật hiển thị, hiệu ứng chiêu thức, nhạc & âm thanh (khi chạy qua `start.bat`).
- Lưu nhân vật bằng `localStorage` của trình duyệt (lưu ngay trong máy).

## ⚠️ Tính năng online đang tạm tắt

- **Chat** & **Giang hồ online** (Supabase): tài khoản, xếp hạng, thư, chợ liên máy.
  Hiện game chạy offline, không yêu cầu đăng nhập và lưu nhân vật bằng `localStorage` trên máy. Muốn bật lại, điền URL và public key Supabase vào `js/chatcfg.js`.

## ⚠️ Đã chỉnh sửa gì so với bản gốc

| Thay đổi | Lý do |
|---|---|
| `js/chatcfg.js`: để trống cấu hình Supabase | Tạm tắt chat và đăng nhập online để game tiếp tục chạy offline, lưu nhân vật trên máy. |
| Kỹ năng Thương Thiên Vương | Các chiêu tấn công chỉ dùng một VFX trúng đòn `m327_hit` cho mỗi mục tiêu; số mục tiêu theo bậc yêu cầu: cấp 10 = 1, cấp 30 = 2, cấp 60 = 3; Truy Tinh Trục Nguyệt = 5. |
| Băng Tung Vô Ảnh (ID 336), tầng 2 | Chỉ phát một VFX `m326_hit` ngay tại vị trí từng mục tiêu trúng đòn. |
| Lệnh GM MAX võ công | Giữ cấp luyện và tiến độ đã lưu của kỹ năng 90; không hạ cấp chúng về 1. |
| Vân Long Kích (ID 361) | Dùng `m2110_fly` làm một tia bay thẳng dài hơn và lớn hơn 1,5 lần; khi trúng mục tiêu phát `m169_hit`. |
| Phạm vi kỹ năng Thiên Vương | Tầm đánh của toàn bộ kỹ năng tấn công Thiên Vương được nhân ×2. |
| Thêm `start.bat` + `server.ps1` | Chạy game qua `localhost` để â thanh hiệu ứng (SFX) và service worker hoạt động |
| Bổ sung 5 file font `fonts/*.woff2` | Bản gốc có CSS trỏ tới font nhưng **chưa deploy file font** (web gốc cũng thiếu). Đã tải đúng bộ IBM Plex Mono 400 từ Google Fonts (giấy phép SIL OFL 1.1) |
| Xoá ~94 file rác | Web gốc trả `200 + HTML` cho mọi đường dẫn không tồn tại (SPA fallback), nên quá trình tải dễ lưu nhầm trang HTML thay cho ảnh/script |

**40 file `img/jx/m/ma_hh_*` và `ma_ht_*` (trang bị ngựa) không tồn tại trên web gốc** → đã xoá file HTML giả.
Code game tự kiểm tra và bỏ qua (`naturalWidth`), nhân vật vẫn hiển thị bình thường.

## 🎛 Bảng GM (công cụ chỉnh sửa nhanh)

Bấm **icon 🛠 GM** — nút này được đặt ở **cả hai vị trí** nên luôn thấy, không phụ thuộc giao diện:

- **Màn hình ngang / giao diện 2.0:** icon 🛠 nằm ở **cuối thanh biểu tượng góc phải** (cùng hàng với Nhân vật · Hành trang · Võ công…).
- **Màn hình dọc / điện thoại:** nút 🛠 **GM** nằm trên **thanh trên cùng**, cạnh nút ⛶.
- Hoặc nhấn phím **F9** bất kỳ lúc nào trong game.

| Nhóm | Nút |
|---|---|
| **Cấp độ** | Ô nhập cấp + `Đặt cấp` · `+1` · `+10` · **★ MAX CẤP (200)** |
| **Tài nguyên** | `+1 triệu lượng` · `+100 triệu` · `MAX lượng` · `+100 KNB` · `MAX KNB` |
| **Điểm** | `+1000 tiềm năng` · `+1000 kỹ năng` · `MAX điểm` · `Hồi đầy máu` |
| **Bản đồ** | `Mở khoá tất cả bãi` (200 bãi) · `Nhảy tới bãi cuối` |
| **Võ công** | `MAX chiêu đã học` · nhận kỹ năng tấn công cấp 9 đúng môn phái ở cấp kỹ năng 1 · **MAX tất cả võ công** (236 chiêu lên cấp tối đa) |
| **Trang bị** | `Cường hóa đồ đang mặc lên +10` · chọn bộ và `Cấp trọn bộ Hoàng Kim` · chọn phái, bộ, Hoàng Kim/Bạch Kim để nhận một vũ khí đúng loại · `Mặc đồ tốt nhất` · `+1 Huyền Tinh` · chỉnh tỷ lệ rơi Hoàng Kim (`100%` = gốc) |
| **Cheat** | `Bất tử` · `Một đòn hạ` · `Quái không đánh` — **được nhớ qua các lần tải lại** |
| **Hệ thống** | `Bỏ qua hướng dẫn` · `Đổi / tạo nhân vật` · `Đóng` |

- Lên cấp bằng GM **cộng đúng số điểm tiềm năng và kỹ năng** tương ứng, không mất tiến trình cũ.
- Mọi thay đổi được `save()` ngay và ghi vào nhật ký game với tiền tố `[GM]` để dễ kiểm tra.
- Nút cường hóa chỉ nâng trang bị đang mặc chưa đạt `+10`; món đã `+10` trở lên được bỏ qua. Cường hóa dùng ngân lượng và xác suất thành công như Lò Rèn; lệnh không tự thay đổi trang bị khác.
- Vật phẩm nhận từ các lệnh GM lấy vũ khí luôn vào **Hành trang**, không bị bộ lọc Lo Ép Đồ chuyển sang Rương ép hoặc tự động mặc. Vật phẩm nhận từ các nguồn khác vẫn theo bộ lọc và cơ chế tự mặc hiện tại.
- Nút nhận kỹ năng môn phái chỉ dùng sau khi gia nhập phái; cấp đúng chiêu tấn công đầu tiên của môn phái (yêu cầu nhân vật cấp 9) ở cấp kỹ năng 1.
- Kỳ Trân Các bán Luyện Công Đơn ×2: nhân đôi kinh nghiệm luyện võ công 90 nhận được khi hạ quái trong 60 phút; mua thêm cộng dồn thời gian.
- Hiệu ứng tầng 2 chỉ hiện từ cấp kỹ năng mở tầng; tầng 3 chỉ hiện từ cấp 16 khi kỹ năng có dữ liệu tầng 3.
- Kỹ năng có đạn bay thẳng hoặc parabol gây sát thương một lần lên mỗi quái nằm trong phạm vi va chạm trên đường bay; không giới hạn số mục tiêu. Đạn vòng, xoáy và đuổi mục tiêu vẫn theo quy tắc mục tiêu riêng.
- Hàng Long Bất Vũ (ID 14) và Hoành Tảo Thiên Quân (ID 319) gây sát thương không giới hạn mục tiêu trong vùng xoay quanh nhân vật, theo bán kính và thuộc tính riêng của từng kỹ năng; VFX chỉ phát một lần mỗi lần dùng.
- Thiên Địa Vô Cực (ID 365) chọn một mục tiêu chính làm tâm chiêu, rồi gây sát thương lên mọi mục tiêu có tâm nằm trong vùng tròn bán kính 218 (ước theo mép VFX sau scale, không cộng bán kính thân quái); sát thương chính chờ tới lúc VFX xuất hiện tại vùng trúng (5 khung) để khớp hoạt ảnh; VFX phóng lớn 1,5 lần và chỉ phát một lần mỗi lần dùng.
- Nhân Kiếm Hợp Nhất (ID 368) hút nội lực theo `stealmana_p` của kỹ năng khi gây sát thương ngoại công; phóng lớn toàn bộ VFX 1,5 lần; dùng `m176_fly` rơi xuống nhân vật rồi phát `m176_hit` ở tầng 2; từ cấp 16, tầng 3 phát thêm `m110_fly` tại vị trí quái trúng đòn.
- Khóa chiêu chính sẽ dùng riêng kỹ năng đã chọn, kể cả khi Xoay chiêu đang bật; nếu không đủ nội lực hoặc kỹ năng không dùng được trong trạng thái hiện tại, nhân vật đánh thường. Trang bị tự động vẫn được so sánh theo chiêu chính đã khóa, không tự đổi lựa chọn chiêu.
- Tốc độ đánh / xuất chiêu từ tốc độ đánh và tốc độ nội công cộng lại tối đa 300%; tốc độ thực tế từng kỹ năng cũng không vượt 300%, kể cả hệ số riêng môn phái.

## 🧪 Tự kiểm thử

Mở `selftest.html`: trang này tự tạo nhân vật mới, đánh quái trong 25 giây rồi
ghi kết quả vào tiêu đề trình duyệt (cấp, máu, số quái, số ảnh tải được…). Đã thử với
Edge headless và **chặn toàn bộ mạng ngoài**: `56/56 ảnh tải thành công, 28 quái xuất hiện`.

## 🔧 File tiện ích

- Trong thư mục game: `start.bat`, `server.ps1`, `selftest.html`, `README.md`.
- Thư mục `E:\JXcod\_tools\`: script dùng để tải/kiểm tra bản sao
  (`download2.ps1`, `validate.ps1`, `cleanup.ps1` + báo cáo kết quả).
