import { useState } from "react";
import { useRecoilState } from "recoil";
import { authState } from "../../recoil/auth";

export default function LoginForm() {
    const [user, setUser] = useRecoilState(authState);
    const [password, setPassword] = useState("");

    const onClick = (e) => {
        alert(`${user.data.username} ${password}`);
    };

    return (
        <>
            <div className="rounded block border bg-white shadow-md p-4 m-2">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Login</h1>
                </div>
                <form className="flex flex-col">
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="username"
                        >
                            아이디
                        </label>
                        <input
                            type="text"
                            value={user.data.username}
                            placeholder="ID"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="username"
                            onChange={(e) =>
                                setUser({
                                    ...user,
                                    data: {
                                        ...user.data,
                                        username: e.target.value,
                                    },
                                })
                            }
                        />
                    </div>
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
                    <div className="mb-4">
                        <button
                            className="border rounded py-2 px-4 bg-blue-500 text-white hover:bg-blue-700"
                            onClick={onClick}
                        >
                            로그인
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
