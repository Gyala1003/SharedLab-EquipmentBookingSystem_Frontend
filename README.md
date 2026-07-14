# SharedLabBookingSystem

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

============================================================

cấu trúc của tree và nhiệm vụ của từng nhánh.
src/app/
├── core/                   <-- (TẠO MỚI: Chứa các dịch vụ hệ thống chạy ngầm)
│   ├── auth/               <-- (TẠO MỚI: Xử lý lưu token, kiểm tra đăng nhập)
│   ├── config/             <-- (TẠO MỚI: Cấu hình URL của API hệ thống)
│   └── http/               <-- (TẠO MỚI: Bộ chặn bắt lỗi HTTP toàn cục)
│
├── shared/                 <-- (TẠO MỚI: Chứa những thứ dùng chung cho nhiều trang)
│   ├── ui/                 <-- (TẠO MỚI: Các nút bấm, thẻ bài, vòng xoay loading)
│   └── layout/             <-- (TẠO MỚI: Khung giao diện chính, thanh menu)
│
└── features/               <-- (TẠO MỚI: Nơi chứa giao diện các trang cụ thể)
    ├── home/               <-- (TẠO MỚI: Trang chủ)
    ├── auth/               <-- (TẠO MỚI: Trang đăng nhập)
    └── users/              <-- (TẠO MỚI: Trang quản lý danh sách người dùng)


src/public/
└── i18n/           quản lý toàn bộ nội dung chữ hiển thị trên giao diện của ứng dụng theo cơ chế Đa ngôn ngữ (i18n - Internationalization).
    ├── vi.json                    
    └── en.json 

==============================================================================================================================

# Frontend Development Guideline

> **Mục tiêu:** Thiết lập nền tảng chung (Base Layout & Base UI) để toàn bộ thành viên Front-end phát triển trên cùng một tiêu chuẩn, tránh xung đột giao diện và giảm thời gian tích hợp sau này.

---

# Quy chuẩn bắt buộc trước khi phát triển

## 1. Cấu hình TailwindCSS (Design System)

Đây là bước đầu tiên và bắt buộc trước khi bất kỳ thành viên nào bắt đầu code giao diện.

Mục đích:

- Định nghĩa màu sắc chủ đạo của hệ thống.
- Định nghĩa font chữ.
- Định nghĩa spacing.
- Định nghĩa border radius.
- Định nghĩa shadow.
- Định nghĩa breakpoint responsive.

Toàn bộ thành viên phải sử dụng chung các giá trị đã được định nghĩa.

**Không tự ý sử dụng màu sắc hoặc kích thước ngoài Design System.**

Ví dụ:

- Primary Color
- Secondary Color
- Success Color
- Error Color
- Font Family
- Font Size
- Border Radius

Điều này giúp toàn bộ giao diện thống nhất và dễ bảo trì.

---

## 2. Base Layout (Application Shell)

Base Layout là khung giao diện dùng chung cho toàn bộ hệ thống.

Layout chịu trách nhiệm:

- Header
- Sidebar (nếu có)
- Footer
- Router Outlet (vùng hiển thị nội dung)

Ví dụ:

```
+----------------------------------------------------+
| Header                                             |
+----------------------------------------------------+
| Sidebar |                                         |
|         |           Router Outlet                 |
|         |                                         |
+----------------------------------------------------+
| Footer                                             |
+----------------------------------------------------+
```

**Lưu ý**

Feature không được phép tự tạo Header hoặc Footer riêng.

Toàn bộ trang phải được render bên trong `<router-outlet>` của Layout.

---

## 3. Quy chuẩn Shared UI

Các thành phần có khả năng tái sử dụng phải đặt trong:

```
shared/ui
```

Ví dụ:

- Button
- Card
- Input
- Logo
- Badge
- Modal
- Spinner

Không được viết lại nhiều lần ở từng Feature.

---

# Công việc đã hoàn thành

## 1. Cấu hình TailwindCSS

Đã tích hợp TailwindCSS vào Angular.

Đã cấu hình PostCSS để Angular nhận diện Tailwind.

```
.postcssrc.json
```

```json
{
    "plugins": {
        "@tailwindcss/postcss": {}
    }
}
```

---

## 2. Xây dựng Base Layout

Đã tạo các thành phần:

```
shared/
└── layout/
    ├── header/
    ├── footer/
    └── public-layout/
```

Trong đó:

### Header

- Logo hệ thống
- Menu điều hướng
- Nút đăng nhập

Header là thành phần dùng chung cho toàn bộ hệ thống và được hiển thị trên tất cả các trang sử dụng Public Layout.

### Footer

- Logo
- Thông tin hệ thống
- Điều hướng nhanh
- Chính sách

### Public Layout

Chịu trách nhiệm hiển thị:

- Header
- Router Outlet
- Footer

Cấu trúc:

```
+------------------------------------------------------+
| Header                                               |
+------------------------------------------------------+
|                                                      |
|                Router Outlet                         |
|                                                      |
+------------------------------------------------------+
| Footer                                               |
+------------------------------------------------------+
```

---

## 3. Xây dựng Base UI

Đã tạo các UI Component đầu tiên:

```
shared/
└── ui/
    ├── button/
    └── logo/
```

Mục tiêu:

- Dùng chung trong toàn bộ hệ thống.
- Giảm việc lặp lại code.
- Đồng nhất giao diện.

---

# Cấu trúc thư mục hiện tại

```
src/app
│
├── core/
│
├── shared/
│   │
│   ├── layout/
│   │   ├── header/
│   │   ├── footer/
│   │   └── public-layout/
│   │
│   └── ui/
│       ├── button/
│       └── logo/
│
└── features/
```

---

# Nguyên tắc phát triển

- Không viết giao diện trực tiếp trong Feature nếu UI có thể tái sử dụng.
- Ưu tiên sử dụng Shared UI Component.
- Không chỉnh sửa Base Layout nếu chưa được thống nhất trong nhóm.
- Các Feature chỉ hiển thị nội dung bên trong `<router-outlet>`.

---

# Công việc đã hoàn thành

### Header

Đã xây dựng Header dùng chung cho toàn hệ thống bao gồm:

- Logo hệ thống
- Menu điều hướng
- Nút đăng nhập

Header được tái sử dụng thông qua Public Layout.

### Footer

Đã xây dựng Footer dùng chung cho toàn hệ thống bao gồm:

- Logo
- Thông tin hệ thống
- Điều hướng nhanh
- Chính sách và bản quyền

Footer được hiển thị trên tất cả các trang sử dụng Public Layout.

---

# Trạng thái hiện tại

| Hạng mục | Trạng thái |
|----------|------------|
| TailwindCSS |  Hoàn thành |
| Design System |  Đang xây dựng |
| Base Layout |  Hoàn thành |
| Base UI |  Đang phát triển |
| Home Feature |  Chưa bắt đầu |
| Authentication |  Chưa bắt đầu |
| Booking | Chưa bắt đầu |