import { selector } from "recoil";
import { authState } from "../atoms/auth";

export const isLoggedIn = selector({
    key: "isLoggedIn",
    get: ({ get }) => get(authState).isLoggedIn,
});
