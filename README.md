### Chức năng chính của project

- Quản lý authentication thông qua access/refresh token
- 3 role: Admin, nhân viên và khách hàng

##### Admin

- Quản lý
  - Tài khoản cá nhân
  - Nhân viên
  - Món ăn
  - Bàn ăn
  - Hoá đơn gọi món
- Thống kê doanh thu

##### Nhân viên

- Quản lý tài khoản cá nhân
- Quản lý hoá đơn gọi món
- Thống kê doanh thu

##### Khách hàng

- Xem menu
- Đặt món thông qua QR Code

---

#### Config .env

- install zod
- file `.env` phải mở đầu bằng `NEXT_PUBLIC...`
  ví dụ:

```bash
NEXT_PUBLIC_API_ENDPOINT=http://localhost:4000
NEXT_PUBLIC_URL=http://localhost:4000
```

- validate cho url ở file `config.ts`

```bash
const configSchema = z.object({
  NEXT_PUBLIC_API_ENDPOINT: z.string(),
  NEXT_PUBLIC_URL: z.string(),
});
```

- với schema ở trên, ta sẽ check xem cái nằm trong env có khớp với validate đã đặt ra không, thông qua cách dùng sau

```bash
const configProject = configSchema.safeParse({
    NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
});
```

- nếu không đúng => trả lỗi

```bash
if (!configProject.success) {
  console.error("Missing env variables", configProject.error.errors);
  throw new Error("Các khai báo biến môi trường không hợp lệ");
}
```

- nếu hợp lệ sẽ export ra obj để sd

```bash
const envConfig = configProject.data;
export default envConfig;
```

### Flow quản lý authentication

##### Đối với NextJS basic

Cách login

1.  Client component gọi api login đến Server Backend để nhận về token
2.  Client lấy token này để gọi tiếp 1 API là `/auth` để đến Next.js Server để Next.js Server lưu token vào cookie client

=> Nếu muốn thao tác với cookie ở domain front-end (thêm, xoá, sửa) thì phải thông qua `Route Handler Nextjs Server`

Đối với project, thay vì khai báo router handler là `/auth`, chuyển sang khai báo router handler cho login luôn

1. Client component gọi api login route handler là `auth/login`
2. Router handler này sẽ gọi tiếp api login đến Server Backend để nhận về token, sau đó lưu token vào cookie client, cuối cùng trả kết quả cho component

=> Gọi là dùng Next.js Server làm proxy trung gian.
Logout cũng tương tự.

- Ở server component biết được login hay chưa dựa vào cookie bà browser gửi lên
- Ở client component biết được login hay chưa dựa vào local storage

---

#### Mô tả sơ lược vị trí folder và các config ban đầu

- Để vào page login -> tất nhiên phải đi qua root layout. Vì UI có xài dark mode -> ThemeProvider đại diện cho nó
  ```bash
  <html lang="en" suppressHydrationWarning>
     <body
       className={cn(
         "min-h-screen bg-background font-sans antialiased",
         fontSans.variable
       )}
     >
       <ThemeProvider
         attribute="class"
         defaultTheme="system"
         enableSystem
         disableTransitionOnChange
       >
         {children}
         <Toaster />
       </ThemeProvider>
     </body>
   </html>
  ```
- Tiếp theo sẽ đi vào `layout.tsx` của folder `public`. Nhìn vào src ta thấy folder public được đặt là `(public)` nghĩa là `sẽ không tính nó là 1 route`
  => Tại layout này sẽ chứa `<NavItem>` -> Menu. Và children tuỳ route xây dựng

- Đi vào `LoginForm` thực hiện submit. Nhưng để caching data phải sử dụng `Tanstack Query` => install
- Khi cài cái này có recommended install thêm eslint tanstack query => khai báo để sử dụng cho tổng src => Ở folder `component` tạo `app-provider.tsx` => bọc lại ở layout tổng
- Submit form login -> đi vào `api/route/login` -> tại đây sẽ gọi đến server backend login -> nhận đc access và refresh token -> set vào `cookies` đồng thời lưu vào local storage đã set ở config http
