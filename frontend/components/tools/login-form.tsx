import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
import { useRecoilState } from "recoil";
import {
    authActions,
    authState,
    FSM,
    LoginState,
    tokenState,
} from "../../recoil/auth";
import * as validator from "class-validator";
import login from "../../pages/api/login";
import { AxiosResponse } from "axios";

/**
 * 로그인 아이디 입력 폼
 *
 * @param user
 * @param setUser
 * @returns
 */
function UsernameInput(
    user: FSM.User,
    setUser: Dispatch<SetStateAction<FSM.User>>
) {
    return (
        <div className="mb-4">
            <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="username"
            >
                아이디
            </label>
            <input
                type="text"
                value={user.username}
                placeholder="ID"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="username"
                onChange={(e) =>
                    setUser({
                        ...user,
                        username: e.target.value,
                    })
                }
            />
        </div>
    );
}

/**
 * 패스워드 입력 폼
 *
 * @param password
 * @param setPassword
 * @returns
 */
function PasswordInput(
    password: string,
    setPassword: Dispatch<SetStateAction<string>>
) {
    return (
        <div className="mb-4">
            <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="username"
            >
                비밀번호
            </label>
            <input
                type="password"
                value={password}
                placeholder="PASSWORD"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                onChange={(e) => setPassword(e.target.value)}
                id="password"
            />
        </div>
    );
}

/**
 * 로그인 처리 폼
 *
 * @param handleClick
 * @returns
 */
function LoginButton(handleClick: (e: any) => Promise<void>) {
    return (
        <div className="mb-4">
            <button
                className="border rounded py-2 px-4 bg-blue-500 text-white hover:bg-blue-700"
                onClick={handleClick}
            >
                로그인
            </button>
        </div>
    );
}

export default function LoginForm() {
    const [user, setUser] = useRecoilState(authState);
    const [token, setToken] = useRecoilState(tokenState);
    const [_login, setLogin] = useRecoilState(LoginState);
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLoginAction = async () => {
        try {
            if (validator.isURL(user.username)) {
                throw new Error("주소를 입력할 수 없습니다.");
            }

            //  로그인 시도
            const preResponse = await fetch("/api/login", {
                method: "POST",
                body: JSON.stringify({
                    username: user.username,
                    password: password,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const response = await preResponse.json();

            console.log(response);

            setToken(response.data.accessToken);
            setLogin(true);
            router.push("/");
        } catch (e) {
            console.log(e);
        }
    };
    const handleClick = async (e) => {
        await handleLoginAction();
    };
    return (
        <>
            <div className="rounded block border bg-white shadow-md p-4 m-2">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Login</h1>
                </div>
                <div className="flex flex-col">
                    {UsernameInput(user, setUser)}
                    {PasswordInput(password, setPassword)}
                    {LoginButton(handleClick)}
                </div>
            </div>
        </>
    );
}
