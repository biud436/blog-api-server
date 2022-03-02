import { useRouter } from "next/router";
import { useState } from "react";
import { useRecoilState } from "recoil";
import {
  authActions,
  authState,
  LoginState,
  tokenState,
} from "../../recoil/auth";

export default function LoginForm() {
  const [user, setUser] = useRecoilState(authState);
  const [token, setToken] = useRecoilState(tokenState);
  const [_login, setLogin] = useRecoilState(LoginState);
  const [password, setPassword] = useState("");
  const router = useRouter();

  const sendData = async () => {
    try {
      const res = await authActions.login(user.username, password);

      setToken(res.data.access_token);
      setLogin(true);
      router.push("/");
    } catch (e) {
      console.log(e);
    }
  };
  const handleClick = async (e) => {
    await sendData();
  };
  return (
    <>
      <div className="rounded block border bg-white shadow-md p-4 m-2">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Login</h1>
        </div>
        <div className="flex flex-col">
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
              onClick={handleClick}
            >
              로그인
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
