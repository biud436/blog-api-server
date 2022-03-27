import { atom, selector } from "recoil";
import { beforeAuthInstance } from "../../lib/axios";
import * as validator from "class-validator";

namespace FSM {
    export type User = {
        id: number;
        email: string;
        username: string;
    };

    export type LoginResponseToken = {
        token: string;
    };

    export type LoginState = boolean;
}

export const authState = atom<FSM.User>({
    key: "authState",
    default: {
        id: 0,
        email: "",
        username: "",
    },
});

export const tokenState = atom<FSM.LoginResponseToken>({
    key: "tokenState",
    default: {
        token: "",
    },
});

export const LoginState = atom<FSM.LoginState>({
    key: "LoginState",
    default: false,
});

export const authActions = {
    async login(username: string, password: string) {
        if (validator.isEmpty(username)) {
            throw new Error("아이디가 없습니다");
        }

        if (validator.isEmpty(password)) {
            throw new Error("비밀번호가 없습니다.");
        }

        if (
            validator.matches(
                username,
                /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
            )
        ) {
            throw new Error("유효하지 않은 아이디입니다");
        }

        if (
            validator.matches(
                password,
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            )
        ) {
            throw new Error("암호는 8자 이상이어야 합니다.");
        }

        return await beforeAuthInstance.post("/auth/login", {
            username,
            password,
        });
    },
};
