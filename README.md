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

#### Logic login - logout

Sau khi làm xong middleware thì login đoạn login/logout không có gì xa lạ.

- Chuẩn bị một useLoginMutation gọi tới authApiRequestLogin

```bash
  // server login
  sLogin: (body: LoginBodyType) => http.post<LoginResType>('/auth/login', body),
  // client login => gọi đến route handler
  login: (body: LoginBodyType) =>
    http.post<LoginResType>('/api/auth/login', body, {
      baseUrl: ''
    }),
```

=> Vậy ở `api/auth/login` xử lý những việc gì???

```bash
export async function POST(request: Request) {
  const body = (await request.json()) as LoginBodyType
  const cookieStore = cookies()
  // bắt đầu gọi server backend để set cookie nhé!!!
  try {
    const { payload } = await authApiRequest.sLogin(body)
    const {
      data: { accessToken, refreshToken }
    } = payload
    // mục đích của việc decode là lấy ra được thời điểm hết hạn của token
    // sau đó dùng nó để set thời hạn cho cookie
    const decodeAccessToken = jwt.decode(accessToken) as { exp: number }
    const decodeRefreshToken = jwt.decode(refreshToken) as { exp: number }

    ;(await cookieStore).set('accessToken', accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodeAccessToken.exp * 1000
    })
    ;(await cookieStore).set('refreshToken', refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodeRefreshToken.exp * 1000
    })

    // có nghĩa là api từ server back end trả về cho mình cái gì
    // thì từ cái route handler mình cũng trả về cái đó
    return Response.json(payload)
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json(error.payload, {
        status: error.status
      })
    } else {
      return Response.json(
        {
          message: 'Internal Server Error'
        },
        {
          status: 500
        }
      )
    }
  }
}
```

=> Việc lưu token đã được thực hiện ở 2 nơi:

- localStorage: đã config ở http
- cookies: set trong đoạn code ở trên

##### Tương tự như thế vs logic logout

Nhưng khi logout, ta không quan tâm token này còn hạn hay không. Chỉ cần user nhấn logout thì lập tức mọi thứ được xoá, và quay về page mặc định nào đó.

---

#### Cập nhật ảnh trang profile

Thực hiện chức năng up ảnh như bình thường. Nhưng có một lỗi trong quá trình chúng ta xử lý
Hãy để ý route `manage/setting` - layout gồm 2 component `DropdownAvatar` và `UpdateProfileForm`.
Hai component này cùng gọi đến `useAccountMe` để lấy thông tin user
=> khi dropdown có thông tin, thì bên form update bị caching data, ko lấy thêm nữa => không set vào form được. Cách giải quyết????

Sử dụng useEffect thoi

```bash
  const { data } = useAccountMe()
  useEffect(() => {
    if (data) {
      const { name, avatar } = data.payload.data
      form.reset({ name, avatar: avatar || '' })
    }
  }, [form, data])
```

---

#### Cập nhật thông tin profile

Thông tin cập nhật gồm avatar và name
Có một lỗi ở chỗ xử lý ảnh cần lưu ý. Với những trường hợp acc đầu tiên tạo ra là null, thì chắc chắn validate ban đầu sẽ bắt và ko submit được đoạn này. Vì vậy hãy fake cho nó pass qua - xử lý chỗ onChange

```bash
  export const UpdateMeBody = z
    .object({
      name: z.string().trim().min(2).max(256),
      avatar: z.string().url().optional()
    })
    .strict()
```

```bash
  <input
      type='file'
      accept='image/*'
      className='hidden'
      ref={avatarInputRef}
      onChange={(e) => {
        const file = e.target.files?.[0]
        if (file) {
          setFile(file)
            field.onChange('http://localhost:3000/' + field.name)
          }
      }}
  />
```

---

#### Cập nhật password

Việc cập nhật password có thể làm thông thường như cái gửi body password cần đổi lên cho server. Nhưng một vấn đề đặt ra là

##### Nếu 2 người cùng xài 1 acc thì khi người này đổi password, server phải xoá access cũng như refresh hiện tại và tạo token mới lưu vào db

=> phải nhớ set lại token cho cookie cũng như local storage để tính năng trọn vẹn

---

#### Xử lý các case hết hạn của token - PHẦN NÀY QUAN TRỌNG LẮM NHAAAA

Bên NextJs chúng ta có tận 2 môi trường: browser và server.

##### Trước tiên phải làm tính năng, khi access token hết, phải logout ra

- Chỉnh time hết hạn cho access là 10s để test
- trong cookies khi hết hạn thì access token tự biến mất (cột expire trong application ak)
- nhưng bên local storage sẽ vẫn còn => phải xoá thủ công
  Thì sau 10s reload lại page thì việc đầu tiên là sẽ đi vào middleware để check trước
  Kiểm tra thấy `accessToken` ko được gửi lên -> vì hết hạn nên cookies đã xoá r -> rơi vào case
  "CHƯA ĐĂNG NHẬP THÌ KHÔNG CHO VÀO PRIVATE PATH" -> `đẩy về login`

nhưng ko có hiện tượng logout nào cả

- refresh token bên cookies vẫn còn
- access/refresh token bên local storage vẫn còn
  => Giờ sẽ xử lý vấn đề này :)

##### 1. Tạo page logout: chuyển hướng của case xử lý bên trên thay vì đẩy về login -> chuyển nó tới page này khi accessToken hết hạn

- Tại đây sử dụng useEffect để gọi mutation Logout. Nhưng cẩn thận vs useEffect tại đây vì có thể sinh ra re-render vô cực

  - Khi `logoutMutation` gọi `mutateAsync` thì nó sẽ bị thay đổi tham chiếu ngay lập tức (vì logoutMutation là 1 obj) => useEffect sẽ nhận thấy, và gọi lại liên tục
    => Cách giải quyết là sẽ lấy `{ mutateAsync}` từ `useLogoutMutation` ra để ko còn bị thay đổi tham chiếu nữa. Nhưng vì react có strict mode nên vẫn cứ bị gọi 2 lần

    => Cách xử lý tiếp theo là khai báo 1 `useRef` cho giá trị của nó = null
    Khi useEffect gọi lần đầu thì `ref.current` chính là = `mutateAsync` đó
    Và khi đang chạy `mutateAsync` thì `setTimeout` 1s sau đó `ref.current` quay lại = null

    => Vậy nghĩa là nếu ref.current này có giá trị thì sẽ return, ko call nữa

##### 2. Đặt trường hợp, nếu một người nào đó vào website và gõ link `/logout` thì sẽ gọi api => logout => không hay

- Phải là `../logout?refreshToken=1234565...` sao cho token khớp vs refresh token lưu trong cookies thì đúng
  => Ở middleware phải phân rõ 3 trường hợp

  - Chưa đăng nhập -> nghĩa là ko có refresh token -> case này đá thẳng về login
  - Ngược lại nếu đã login rồi -> có quyền truy cập vào private paths - nhưng ko được vào login
  - Và TH thứ 3, đây là case cần giải quyết`Login rồi nhưng accessToken hết hạn`

    ```bash
      if (privatePaths.some((path) => pathname.startsWith(path)) && !accessToken && refreshToken) {
        const url = new URL('/logout', req.nextUrl)
        url.searchParams.set('refreshToken', req.cookies.get('refreshToken')?.value ?? '')
        return NextResponse.redirect(url.toString())
      }
    ```

##### Nếu access và refresh token vẫn còn hạn nhưng vì một lý do nào đó mà server trả về 401 thì lúc đó phải làm gì???

- trong page logout gọi api `sMe` ở server component và xử lý lỗi redirect khi rơi vào case ở http (là cho nó throw thoải mái, nếu không sẽ không quay về logout được, đó là một case đặt biệt của REDIRECT)

```bash
  // TH khi access token chúng ta còn hạn
  // và gọi api ở Nextjs Server (Route Handler, Server component) đến server Back-end
    const accessToken = (options?.headers as any)?.Authorization.split('Bearer ')[1]
        redirect(`logout?accessToken=${accessToken}`
```

- check thêm access token trong page logout nữa để khớp với redirect bên trên.

---

#### Refresh token trong NextJs - RẤT QUAN TRỌNG

Các API yêu cầu Authentication có thể được gọi ở 2 nơi

1. ServerComponent: Ví dụ `/account/me` cần gọi API `/me` ở server component để lấy thông tin profile của user

2. Client component: Ví dụ page `/account/me` cần gọi API `/me` ở client component để lấy thông tin profile của user

=> Việc hết hạn có thể xảy ra ở Server Component và Client Component

##### Các trường hợp hết hạn access token

- Đang dùng thì hết hạn: Chúng ta sẽ không để trường hợp này xảy ra, bằng cách `có 1 set interval check token liên tục để refresh token trước khi nó hết hạn`

- Lâu ngày không vào web, vào lại thì hết hạn:
  Khi vào lại website thì middleware.ts sẽ được gọi đầu tiên. Chúng ta sẽ kiểm tra access token còn không(vì nó sẽ bị xoá khi hết hạn trong cookies, nhưng refresh vẫn còn -> nghĩa là còn vòng đời login), nếu không còn thì `gọi cho redirect về page client component có nhiệm vụ gọi API refresh token và redirect ngược lại về trang cũ`

_Lưu ý:_

- Không cho refresh token liên tục
- Thứ tự trong middleware

<u>Tạo refresh token router handler</u>

- Gọi đến server back-end để lấy profile
  ```bash
    sMe: (accessToken: string) =>
    http.get<AccountResType>(`${prefix}/me`, { headers: { Authorization: `Bearer ${accessToken}` } })
  ```
- `sRefreshToken` có route là `/auth/refresh-token`
- `refreshToken` đi đến `/api/auth/refresh-token`
- Xử lý route handler khi redirect về logout:
  - Lấy access/refresh token từ url
  - Kiểm tra nếu token ở url khác với local storage thì coi như bỏ
  - nếu đúng thì xử lý logout để return đúng về login

##### Xử lý gạch đầu dòng thứ nhất: Đang dùng thì access token hết hạn

<u>Lưu ý, để tránh bị bug trong lúc thực hiện Đang dùng thì hết hạn</u>

- Không để cho refresh token bị duplicate: <b>NHỚ CLEAR INTERVAL TRONG CLEAN UP FUNCTION</b>
- Khi refresh token bị lỗi ở route handler => trả về 401, bất kể lỗi gì: <b>KHI CÓ LỖI NHẢY VÀO CATCH CŨNG CLEAR INTERVAL NỐT</b>
- Khi refresh token bị lỗi ở useEffect client => <b> ngừng interval ngay</b>
- Đưa logic check vào layout ở trang authenticated: Không cho chạy refresh token ở những trang unauthenticate như: login, logout
- Kiểm tra logic flow trong middleware

##### Vậy logic ở refresh-token.tsx sẽ như nào??

```bash
  // Paths that do not require authentication
  const UNAUTHENTICATED_PATHS = ['/login', '/register', 'refresh-token']
  export default function RefreshToken() {
    const pathname = usePathname()
    useEffect(() => {
      if (UNAUTHENTICATED_PATHS.includes(pathname)) return
      let interval: any
      const checkAndRefresh = async () => {
        // không nên đưa logic lấy token ra khỏi function này
        // để mỗi lần được gọi thì sẽ lấy được token mới
        // tránh hiện tượng bug và lấy token đầu, xong gọi cho những lần tiếp theo

        const accessToken = getAccessTokenFromLocalStorage()
        const refreshToken = getRefreshTokenFromLocalStorage()
        if (!accessToken || !refreshToken) return
        const decodeAccessToken = jwt.decode(accessToken) as { exp: number; iat: number }
        const decodeRefreshToken = jwt.decode(refreshToken) as { exp: number }

        // thời điểm hết hạn của token là tính theo epoch time (s)
        // còn khi dùng cú pháp new Date().getTime() thì sẽ trả về epoch time (ms)

        const now = Math.round(new Date().getTime() / 1000)
        // TH fresh token hết hạn => ko xử lý nữa
        // ví dụ access token có thời gian hết hạn là 10s
        // thì mình kiểm tra còn 1/3 thời gian (là 3s) thì sẽ cho refresh token lại
        // time còn lại = decodeAccessToken.exp - now
        // time hết hạn của access token = decodeAccessToken.exp - decodeAccessToken.iat

        if (decodeAccessToken.exp - now < (decodeAccessToken.exp - decodeAccessToken.iat) / 3) {
          try {
            const res = await authApiRequest.refreshToken()
            setAccessTokenToLocalStorage(res.payload.data.accessToken)
            setRefreshTokenToLocalStorage(res.payload.data.refreshToken)
          } catch (error) {
            clearInterval(interval)
          }
        }
      }
      // phải gọi lần đầu tiên vì interval sẽ chạy sau thời gian timeout
      checkAndRefresh()
      // timeout interval phải bé hơn time hết hạn của access token
      // ví dụ time hết hạn access token là 10s thì 1s mình check 1 lần
      const TIMEOUT = 1000
      interval = setInterval(checkAndRefresh, TIMEOUT)
      return () => clearInterval(interval)
    }, [pathname])
    return null
  }
```

Chú thích ở từng dòng code rất rõ ràng. Sau khi thực hiện việc check gọi lấy token mới. Khai báo ở AppProvider luôn, vì đã check chỉ hoạt động ở các page ko phải là login, register..

```bash
const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <RefreshToken />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

Còn ở route `api/auth/refresh-token`, ở đây xử lý y hệt login, gọi lên server back end, trả về token mới và thực hiện lưu.
Còn một vấn đề quan trọng, phải ngăn gọi refresh token 2 lần ở `api/auth/refresh-token.ts`.
Khi api `refreshToken` đang được gọi, không làm thêm gì khác.

```bash
  refreshTokenRequest: null as Promise<{
    status: number
    payload: RefreshTokenResType
  }> | null,
  async refreshToken() {
    if (this.refreshTokenRequest) return this.refreshTokenRequest
    this.refreshTokenRequest = http.post<RefreshTokenResType>('/api/auth/refresh-token', null, { baseUrl: '' })
    const result = await this.refreshTokenRequest
    this.refreshTokenRequest = null
    return result
  }
```

##### Xử lý gạch đầu dòng thứ hai: Lâu ngày không vào web, đến khi vào thì hết hạn access token | `gọi cho redirect về page client component có nhiệm vụ gọi API refresh token và redirect ngược lại về trang cũ`

1. Đầu tiên vào web thì phải đi qua `middeware.ts`
   Trước đó đã xử lý khi hết `accessToken` thì redirect về `logout`

```bash
  // Đăng nhập rồi nhưng accessToken hết hạn
  if (privatePaths.some((path) => pathname.startsWith(path)) && !accessToken && refreshToken) {
    const url = new URL('/refresh-token', req.nextUrl)
    url.searchParams.set('refreshToken', req.cookies.get('refreshToken')?.value ?? '')
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url.toString())
  }
```

2. Đem hàm `checkAndRefresh` bỏ vào utils để sd ở cả 2 chỗ, có thể truyền `onSucess` hoặc `onError` vào để xử lý.

- Nếu thành công, lấy redirect ở đoạn code mục 1 để redirect về đúng page
- Nếu có lỗi, nghĩa là hết hạn refresh luôn => tắt setInterval để ko bị lặp lại => quay về login

#### Đang dùng thì refresh token hết hạn

Trường hợp này đối với access token thì rắc rối, nhưng với refresh thì đơn giản hơn. Nếu nhận thấy nó hết hạn => xoá local storage và xử lý cho quay về trang login. Mình sẽ xử lý ở 2 chỗ

- File utils

```bash
  // TH fresh token hết hạn => cho logout
  if (decodeRefreshToken.exp < now) {
    removeTokenLocalStorage()
    return param?.onError && param.onError()
  }
```

- refresh-token.tsx

```bash
  checkAndRefresh({
      onError: () => {
        clearInterval(interval)
        router.push('/login')
      }
  })
```

#### Lỗi refresh token hết hạn nhưng ko redirect về login???

- Không nên làm tròn khi so sánh giá trị exp
- Khi set cookie với expire thì sẽ bị lệch từ 0 - 1000ms
- Router Cache mặc định Next.js là 30s kể từ lần request gần nhất

useEffect ở LoginForm chạy trước useEffect ở NavItem
mà ở LoginForm là xoá token
ở NavItem là check xem token có ko
=> luôn chạy trước z nghĩa là nó luôn là false
=> Loằng ngoằng quá biến chỗ này thành state lưu trong context điiii

1. Ở `middleware`, TH nếu không có `refresh token`, thêm vào searchParam <u>clearToken</u>

```bash
if (!refreshToken && privatePaths.some((path) => pathname.startsWith(path))) {
    const url = new URL('/login', req.nextUrl)
    url.searchParams.set('clearToken', 'true')
    return NextResponse.redirect(url.toString())
  }
```

2. Thêm `context` vào `app-provider`. Sử dụng `useEffect` để check nếu có `accessToken` thì `isAuth` là true

```bash
  const AppContext = createContext({
    isAuth: false,
    setIsAuth: (isAuth: boolean) => {}
  })

  export const useAppContext = () => {
    return useContext(AppContext)
  }
  const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuth, setIsAuthState] = useState(false)
    const setIsAuth = (isAuth: boolean) => {
      if (isAuth) {
        setIsAuthState(isAuth)
      } else {
        setIsAuthState(false)
        removeTokenLocalStorage()
      }
    }
    useEffect(() => {
      const accessToken = getAccessTokenFromLocalStorage()
      if (accessToken) {
        setIsAuthState(true)
      }
    }, [])

    // Nếu dùng react 19 và next 15 thì ko cần AppContext.Provider
    return (
      <AppContext value={{ isAuth, setIsAuth }}>
        <QueryClientProvider client={queryClient}>
          {children}
          <RefreshToken />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </AppContext>
      )
  }
```

3. Sau khi check ở `app-provider` rồi thì `Nav-Item` cũng như ở các page khác cần check token chỉ cần gọi ra là được

```bash
  const { isAuth, setIsAuth } = useAppContext()
```

---

Các thao tac thuộc về CRUD của

- accounts
- dishes
- tables
  Sẽ không có gì cần nói nhiều, nhưng đến phần hiển thị QRCode của bàn ăn, sẽ có cái cần chú ý

1. Thư viện QRCode nó sẽ vẽ lên thẻ Canvas
2. Tạo 1 thẻ canvas ảo để thư viện QRCode vẽ lên cái ảo đó
3. Khi edit sẽ edit lên canvas thật
4. Cuối cùng thì sẽ đưa thẻ canvas ảo chứa QRCode ở trên vào thẻ canvas thật

---

#### Fetch dữ liệu món ăn cho trang chủ

Gọi thẳng server -> sẽ không thấy gọi api ở tab network. Cách làm như sau

```bash
export default async function Home() {
  let dishList: DishListResType['data'] = []
  try {
    const result = await dishApiRequest.list()
    const {
      payload: { data }
    } = result
    dishList = data
  } catch (error) {
    return <div>Something went wrong</div>
  }
  return (
    <div className='w-full space-y-4'>
      <section className='relative'>
        <span className='absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10'></span>
        <Image
          src='/banner.png'
          width={400}
          height={200}
          quality={100}
          alt='Banner'
          className='absolute top-0 left-0 w-full h-full object-cover'
        />
        <div className='z-20 relative py-10 md:py-20 px-4 sm:px-10 md:px-20'>
          <h1 className='text-center text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold'>Nhà hàng Big Boy</h1>
          <p className='text-center text-sm sm:text-base mt-4'>Vị ngon, trọn khoảnh khắc</p>
        </div>
      </section>
      <section className='space-y-10 py-16'>
        <h2 className='text-center text-2xl font-bold'>Đa dạng các món ăn</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-10'>
          {dishList.map((dish) => (
            <div className='flex gap-4 w' key={dish.id}>
              <div className='flex-shrink-0'>
                <Image
                  src={dish.image}
                  width={150}
                  height={150}
                  alt={dish.name}
                  quality={100}
                  className='object-cover w-[150px] h-[150px] rounded-md'
                />
              </div>
              <div className='space-y-1'>
                <h3 className='text-xl font-semibold'>{dish.name}</h3>
                <p className=''>{dish.description}</p>
                <p className='font-semibold'>{formatCurrency(dish.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
```

<b>Chỗ image khi bị báo lỗi đừng quên vào `next.config.msj` để config lại nhé </b>

```bash
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/**'
      }
    ]
  }
}
```

#### Tất cả những lỗi liên quan đến `useSearchParams` khi `npm run build` thì hãy xài <u>Suspense</u>

---

Quay lại trang chủ - nơi mà show các món ăn - api này ko cần token cũng run được

\*\*Đặt câu hỏi Nếu api get list

```bash
list: () => http.get<DishListResType>(`${prefix}`) [1]
```

mình sửa thành

```bash
  list: () => http.get<DishListResType>(`${prefix}`, cache: 'no-store'), [2]
```

thì nó sẽ làm cho page dish này chuyển thành <i>Dynamic Rendering</i> tại nó là Static. Nhưng làm sao để check được Static????
Vào thư mục .next -> server -> app -> index.html tìm thấy từ nào có tên là "Spaghetti" => nó phải fetch được api thì mới có dòng chữ này -> đó nghĩa là static rồi.

Nhưng khi thêm cache: 'no-store' thì nó lại thành dynamic. Vì sao?? `cache: 'no-store'` nghĩa là nó không có cache nữa, mỗi khi người dùng request vào trang web nó sẽ render ra content mới nhất -> render content mới nhất mỗi khi request thì làm sao mà cache = đồng nghĩa với việc không tạo ra file static nữa

=> Đối với Next.js 15 thì mặc định fetch sẽ là {cache: no-store} => dynamic rendering page
Hiện tại Next.js 14 thì mặc định fetch sẽ là { cache: 'force-cache'} => nghĩa là cache (static rendering page)
Và nếu bạn xài như [1] thì có nghĩa là nó sẽ fetching mỗi lần build

##### Khi mà chúng ta đã build ra 1 project Nextjs rồi, nó đã render ra 1 file html rồi thì file đó KHÔNG THAY ĐỔI => gây ra vấn đề caching rất khó chịu !!!!

1. Build project
2. npm run start
3. Vào sửa tên 1 món nào đó. vd: Spaghetti -> Spaghetti123
4. Vào web = trình duyệt khác, vẫn là Spaghetti???? ko cập nhật cái mới
5. Vào .next check file index -> search thấy vẫn là Spaghetti
   ==> Search docs về Revalidate Data, ta nhận thấy có 2 kiểu làm

- Theo thời gian: `fetch('https: ...', {next: {revalidate: 3600}})` => page nào dùng fetch api này nó sẽ tự build lại sao 1p
- Revalidate ngay lập tức: `fetch('https: ...', {next: {tags: ['dishes']}})` - và mình sẽ dùng cái này

```bash
  list: () => http.get<DishListResType>(`${prefix}`, { next: { tags: ['dishes'] } }),
```

Sau đó vào src -> api -> tạo file revalidate/route.ts

```bash
  export async function GET(request: NextRequest) {
    const tag = request.nextUrl.searchParams.get('tag')
    revalidateTag(tag!)
    return Response.json({ revalidated: true, now: Date.now() })
  }
```

Khai báo thêm trong apiRequest -> revalidate.ts

```bash
  const revalidateApiRequest = (tag: string) => http.get(`/api/revalidate?tag=${tag}`, { baseUrl: '' })
```

Sau đó thêm gọi ra ở sau khi tạo hoặc edit món ăn thành công! => Thì khoảnh khắc user vào trang web ở bất cứ trình duyệt nào cũng sẽ có data mới nhất

---

#### Khách gọi món & Websocket

#### Table

Khi thay đổi token của table thì server sẽ xoá các refresh token của guest liên quan đến table đó. Điều này sẽ làm cho guest phải đăng nhập lại khi access token kết thúc. Mục đích là để ngăn chặn việc guest dặt đơn phá quán

- status table là hidden, reversed thì guest sẽ không thể login và gọi món từ bàn đó
- status table là hidden thì admin/employee cũng ko thể tạo order từ bàn đó. Chỉ còn Reversed thì admin/employee có thể tạo đơn hàng từ bản đồ

---

### Role Based Access Control và Permission Based Access Control

#### Access Control

Là kiểm soát quyền truy cập. Có 2 kiểu phổ biến:

- Role Based Access Control (RBAC): kiểm soát quyền truy cập dựa trên vai trò người dùng
- Permission Based Access Control (PBAC): kiểm soát quyền truy cập dựa trên quyền của từng chức năng user

#### Role Based Access Control (RBAC)

Hệ thống quản lý quán ăn sẽ có 3 role chính

- Admin: có quyền thao tác mọi chức năng
- Employee: có quyền thao tác một số chức năng tạo như order, xem order nhưng không thể quản lý nhân viên khác
- Guest: chỉ có quyền xem menu, tạo order

Các quyền hạn ở mỗi role thường được định nghĩa cố định khi code
Tất nhiên bình thường ở dự án khác cũng có thể code hệ thống thay đổi quyền hạn trên mỗi role 1 cách linh hoạt. Nhưng lưu ý là thay đổi quyền hạn trên mỗi role chứ ko phải là trên mỗi acc.

<u><i>Mỗi acc sẽ được gắn với 1 role trên</i></u>

#### Permission Based Access Control (PBAC)

Thay vì chia theo role hệ thống sẽ chia theo từng quyền hạn cụ thể
Vd: khi tạo acc, sẽ chọn 1 vài quyền cho acc này: READ_PROFILE, CREATE_ORDER...

Khi cần thêm quyền hạn mới, admin sẽ thêm quyển hạn đó cho tài khoản cụ thể
Đây vừa là ưu điểm, vừa là nhược điểm
=> cách này linh hoạt hơn, vì có thể thêm quyền hạn mới cho từng người mà không cần phải tạo role mới
Nhưng nó cũng khó kiểm soát các acc nếu lỡ sinh ra quá nhiều quyền hạn, khi hệ thống có quá nhiều tài khoản.

---

#### Stateful and Stateless Authentication

Đây là 2 kiểu xác thực phổ biến nhất, đều dùng token để xác thực. Vậy sự khác biệt ở đây là gì?

##### Stateful Authentication

Token có thể là 1 string ngẫu nhiên hoặc JWT.

Token sẽ được lưu trên server trong RAM server hoặc trong DB và client

Mỗi lần client gửi request lên server, server sẽ request vào danh sách để kiểm tra xem token có hợp lệ không.

##### Stateless Authentication

Token thường là JWT
Token không cần lưu ở server, chỉ cần lưu ở client là được
Mỗi lần client gửi request lên server, server sẽ kiểm tra token có hợp lẹ không dựa trên thuật toán mã hoá, không cần request vào database.

#### So sánh

#### Quyền trong dự án

- Owner: có quyền thao tác mọi thứ, ngoại trừ việc gọi api order vs vai trò là Guest
- Employee: Tương tự Owner nhưng không có chức năng quản lý tài khoản nhân viên
- Guest: Chỉ có quyền tạo order

##### Chỗ role này có 1 vấn đề cần lưu ý

Khi bạn là Owner và bạn vào đổi role cho 1 nhân viên nào đó -> Lúc này nhân viên được đổi role nếu đang đăng nhập thì token đang đăng nhập lập tức được đổi để phù hợp. Thì chỗ này mình sẽ cập nhật thông qua socket.

```bash
export default function RefreshToken() {
  const pathname = usePathname()
  const router = useRouter()
  useEffect(() => {
    if (UNAUTHENTICATED_PATHS.includes(pathname)) return
    let interval: any

    const onRefreshToken = (force?: boolean) =>
      checkAndRefresh({
        onError: () => {
          clearInterval(interval)
          router.push('/login')
        },
        force
      })
    // phải gọi lần đầu tiên vì interval sẽ chạy sau thời gian timeout
    onRefreshToken()

    // timeout interval phải bé hơn time hết hạn của access token
    // ví dụ time hết hạn access token là 10s thì 1s mình check 1 lần
    const TIMEOUT = 1000
    interval = setInterval(onRefreshToken, TIMEOUT)

    if (socket.connected) {
      onConnect()
    }
    function onConnect() {
      console.log(socket.id)
    }
    function onDisconnect() {
      console.log('Disconnected from socket')
    }

    function onRefreshTokenSocket() {
      onRefreshToken(true)
    }
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('refresh-token', onRefreshTokenSocket)
    return () => {
      clearInterval(interval)
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('refresh-token', onRefreshToken)
    }
  }, [pathname, router])
  return null
}
```

Thắc mắc tiếp theo hoặc xem tới đây mà quên hàm `checkAndRefresh` để làm gì thì có tóm tắt ngắn gọn như sau, hàm đó cập nhật lại access/refresh token mới khi nó gần hết hạn. Giờ chưa hết mà bị đổi role cũng cập nhật lại luôn => mới thêm 1 biến <b>force</b>

```bash
export const checkAndRefresh = async (param?: { onError?: () => void; onSuccess?: () => void; force?: boolean }) => {
  // không nên đưa logic lấy token ra khỏi function này
  // để mỗi lần được gọi thì sẽ lấy được token mới
  // tránh hiện tượng bug và lấy token đầu, xong gọi cho những lần tiếp theo
  const accessToken = getAccessTokenFromLocalStorage()
  const refreshToken = getRefreshTokenFromLocalStorage()
  if (!accessToken || !refreshToken) return
  const decodeAccessToken = decodeToken(accessToken)
  const decodeRefreshToken = decodeToken(refreshToken)
  // thời điểm hết hạn của token là tính theo epoch time (s)
  // còn khi dùng cú pháp new Date().getTime() thì sẽ trả về epoch time (ms)
  const now = new Date().getTime() / 1000 - 1
  // TH fresh token hết hạn => cho logout
  if (decodeRefreshToken.exp <= now) {
    removeTokenLocalStorage()
    return param?.onError && param.onError()
  }
  // ví dụ access token có thời gian hết hạn là 10s
  // thì mình kiểm tra còn 1/3 thời gian (là 3s) thì sẽ cho refresh token lại
  // time còn lại = decodeAccessToken.exp - now
  // time hết hạn của access token = decodeAccessToken.exp - decodeAccessToken.iat
  if (param?.force || decodeAccessToken.exp - now < (decodeAccessToken.exp - decodeAccessToken.iat) / 3) {
    try {
      const res = await authApiRequest.refreshToken()
      const { accessToken, refreshToken } = res.payload.data
      setAccessTokenToLocalStorage(accessToken)
      setRefreshTokenToLocalStorage(refreshToken)
      param?.onSuccess && param.onSuccess()
    } catch (error) {
      param?.onError && param.onError()
    }
  }
}
```

---

#### Sau khi bạn phân quyền xong, thì chỉ có role Owner mới được vào route manage accounts thôi

=> giờ mình sẽ sửa nó ở middleware

```bash
  // Vào không đúng role, redirect về trang chủ
  const role = decodeToken(refreshToken as string)?.role
  // Guest nhưng cố vào role Owner
  const isGuestGoToManagePath = role === Role.Guest && managePaths.some((path) => pathname.startsWith(path))
  // Không phải Guest nhưng cố vào role Guest
  const isNotGuestGoToGuestPath = role !== Role.Guest && guestPaths.some((path) => pathname.startsWith(path))
  // Không phải Owner nhưng cố tình truy cập vào các route dành cho owner
  const isNotOwnerGoToOwnerPath = role !== Role.Owner && onlyOwnerPaths.some((path) => pathname.startsWith(path))
  if (isGuestGoToManagePath || isNotGuestGoToGuestPath || isNotOwnerGoToOwnerPath) {
    return NextResponse.redirect(new URL('/', req.nextUrl).toString())
  }
```
