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

#### Phân tích ưu nhược của 2 cơ chế quản lý đăng nhập ở server và client

1. Static rendering: được rerender trước khi chúng ta build
2. Dynamic rendering: nào có request thì bắt đầu mới render (ko có build HTML sẵn) -> mỗi cái request nó sẽ lại tạo ra 1 cái
   Có 3 cái nếu sử dụng thì sẽ thành `Dynamic` - cookies() - headers() - searchParams()
   Chỉ cần trong page có khai báo như này, ví dụ:
   ```bash
    const cookieStore = cookies()
    const accessToken = cookiesStore.get('accessToken')
   ```
   => Để người dùng vào nhanh hơn thì mình phải chuyển thành static rendering. Nhưng nếu không có cookies làm sao xác định được người dùng đã đăng nhập trên server???
   Thật sự là không có cách nào cả. Chúng ta chỉ có thể check ở client thôi.

##### Mục tiêu là sẽ chỉnh lại menu, sao cho khi đăng nhập rồi, sẽ ko hiện nút login nữa

- ###### nav-item.tsx
  - check isLogin thông qua get accessToken ở localStorage
  - Thì localStorage nó chỉ có giá trị khi chạy trong môi trường `Browser` thôi. Còn ở đây, ở `NavItems` thì đang sử dụng `use client` -> nó sẽ chạy ở 2 môi trường: 1 là khi chúng ta build, 2 là chạy ở browser => thì ngay lúc build này đã ko nhận dạng được localStorage ở NavItem => và đã bị lỗi rồi `localStorage is not defined`
    => check nếu nó ko phải browser (`typeof window !== 'undefined'`) thì trả về null
  - Tiếp theo 1 vấn đề khác, rất thường hay gặp ở NextJs. Ở server page này là static rendering - trạng thái chưa đăng nhập (vì ở server chưa check cookie gì) => `nav-item` này ko biết đăng nhập hay chưa => lại trả về button Đăng nhập tiếp
    => Để fix case này thì ..
    NÊN CHECK TRONG UseEffect - để sau khi mount, nó lại check lại lần nữa, và render ra đúng menu
    ```bash
      const [isAuth, setIsAuth] = useState(false)
      useEffect(() => {
        setIsAuth(Boolean(getAccessTokenFromLocalStorage()))
      }, [])
      return menuItems.map((item) => {
        if ((item.authRequired === false && isAuth) || (item.authRequired === true && !isAuth)) return null
        return (
          <Link href={item.href} key={item.href} className={className}>
            {item.title}
          </Link>
        )
      })
    ```

#### Middleware điều hướng request người dùng

Quản lý việc nếu người dùng chưa/hoặc đã đăng nhập rồi thì sẽ được phép hoặc không được phép vào page nào.
Tạo `middleware.ts` trong folder `src` nhé!!!!

```bash
const privatePaths = ['/manage']
const unAuthPaths = ['/login']
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isAuth = Boolean(req.cookies.get('accessToken')?.value)
  // vd:  pathname: /manage/dashboard
  if (privatePaths.some((path) => pathname.startsWith(path)) && !isAuth) {
    // nếu muốn vào private path mà chưa login thì redirect về login
    return NextResponse.redirect(new URL('/login', req.nextUrl).toString())
  } else if (unAuthPaths.some((path) => pathname.startsWith(path)) && isAuth) {
    // nếu đã login rồi thì không cho vào login nữa
    return NextResponse.redirect(new URL('/', req.nextUrl).toString())
  }
  return NextResponse.next()
}
export const config = {
  matcher: ['/manage/:path*', '/login']
}

```
