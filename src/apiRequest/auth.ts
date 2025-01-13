import http from "@/lib/http";
import { LoginBodyType, LoginResType } from "@/schemaValidations/auth.schema";

const authApiRequest = {
  // server login
  sLogin: (body: LoginBodyType) => http.post<LoginResType>("/auth/login", body),
  // client login => gọi đến route handler
  login: (body: LoginBodyType) =>
    http.post<LoginResType>("/api/auth/login", body, {
      baseUrl: "",
    }),
};
export default authApiRequest;
