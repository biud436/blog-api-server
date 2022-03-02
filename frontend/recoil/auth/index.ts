import { atom, selector } from "recoil";
import { beforeAuthInstance } from "../../lib/axios";

export const authState = atom({
  key: "authState",
  default: {
    id: "",
    email: "",
    username: "",
  },
});

export const tokenState = atom({
  key: "tokenState",
  default: {
    token: "",
  },
});

export const LoginState = atom({
  key: "LoginState",
  default: false,
});

export const authActions = {
  async login(username: string, password: string) {
    return await beforeAuthInstance.post("/auth/login", {
      username,
      password,
    });
  },
};
