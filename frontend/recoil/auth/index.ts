import { atom, selector } from "recoil";

export const authState = atom({
    key: "authState",
    default: {
        isLoggedIn: false,
        data: {
            id: "",
            email: "",
            username: "",
        },
    },
});

export const isLoggedIn = selector({
    key: "isLoggedIn",
    get: ({ get }) => get(authState).isLoggedIn,
});
