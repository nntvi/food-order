import { normalizePath } from "@/lib/utils";
import { LoginResType } from "@/schemaValidations/auth.schema";
import { redirect } from "next/navigation";

type CustomOptions = Omit<RequestInit, "method"> & {
  baseUr?: string | undefined;
};

const ENTITY_ERROR_STATUS = 422;
const AUTHENTICATION_ERROR_STATUS = 401;

type EntityErrorPayload = {
  message: string;
  errors: {
    field: string;
    message: string;
  };
};

export class HttpError extends Error {
  status: number;
  payload: {
    message: string;
    [key: string]: any;
  };

  constructor({
    status,
    payload,
    message = "Lỗi HTTP",
  }: {
    status: number;
    payload: any;
    message?: string;
  }) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export class EntityError extends HttpError {
  status: typeof ENTITY_ERROR_STATUS;
  payload: EntityErrorPayload;
  constructor({
    status,
    payload,
  }: {
    status: typeof ENTITY_ERROR_STATUS;
    payload: EntityErrorPayload;
  }) {
    super({ status, payload, message: "Lỗi thực thể" });
    this.status = status;
    this.payload = payload;
  }
}

let clientLogoutRequest: null | Promise<Response> = null;
export const isClient = typeof window !== "undefined";

const request = async <Response>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  options?: CustomOptions | undefined
) => {
  let body: FormData | string | undefined;
  if (options?.body instanceof FormData) {
    body = options.body;
  } else if (options?.body) {
    body = JSON.stringify(options.body);
  }
  const baseHeaders: {
    [key: string]: string;
  } =
    body instanceof FormData
      ? {}
      : {
          "Content-Type": "application/json",
        };
  if (isClient) {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      baseHeaders.Authorization = `Bearer ${accessToken}`;
    }
  }
  const baseUrl = options?.baseUr || process.env.NEXT_PUBLIC_API_URL;
  const fullUrl = `${baseUrl}/${normalizePath(url)}`; // Normalize path to remove leading slash
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      ...baseHeaders,
      ...options?.headers,
    },
    body,
    method,
  });
  const payload: Response = await response.json();
  const data = {
    status: response.status,
    payload,
  };
  if (!response.ok) {
    if (response.status === ENTITY_ERROR_STATUS) {
      throw new EntityError(
        data as {
          status: typeof ENTITY_ERROR_STATUS;
          payload: EntityErrorPayload;
        }
      );
    } else if (response.status === AUTHENTICATION_ERROR_STATUS) {
      if (isClient) {
        if (!clientLogoutRequest) {
          clientLogoutRequest = fetch("/api/auth/logout", {
            method: "POST",
            body: null, // logout cho phép luôn luôn thành công. Nếu accessToken hết hạn => xoá luôn
            headers: {
              ...baseHeaders,
            } as any,
          });
          try {
            await clientLogoutRequest;
          } catch (error) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            clientLogoutRequest = null;
            // Redirect về login có thể dẫn đến looop vô hạn nếu không đc xử lý đúng cách
            // Vì nếu rơi vào case ở trang login, có gọi api cần accessToken
            // Mà accessToken đã bị xoá => lại nhảy vào đây => lại redirect => ...
            location.href = "/login";
          }
        }
      } else {
        const accessToken = (options?.headers as any)?.Authorization.split(
          "Bearer "
        )[1];
        redirect(`logout?accessToken=${accessToken}`);
      }
    } else {
      throw new HttpError(data);
    }
  }
  // đảm bảo việc xử lý chỉ chạy ở phía client
  if (isClient) {
    const normalizeUrl = normalizePath(url);
    if (normalizeUrl === "api/auth/logout") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } else if (normalizeUrl === "api/auth/login") {
      const { accessToken, refreshToken } = (payload as LoginResType).data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    }
  }

  return data;
};
const http = {
  get: <Response>(
    url: string,
    options?: Omit<CustomOptions, "body"> | undefined
  ) => request<Response>("GET", url, options),
  post: <Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, "body"> | undefined
  ) => request<Response>("POST", url, { ...options, body }),
  put: <Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, "body"> | undefined
  ) => request<Response>("PUT", url, { ...options, body }),
  delete: <Response>(
    url: string,
    options?: Omit<CustomOptions, "body"> | undefined
  ) => request<Response>("DELETE", url, { ...options }),
};

export default http;