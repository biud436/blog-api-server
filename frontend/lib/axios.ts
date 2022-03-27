import axios from "axios";
import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();

/**
 * 로그인 후
 */
export const instance = axios.create({
    baseURL: publicRuntimeConfig.backendUrl,
});

/**
 * 로그인 전
 */
export const beforeAuthInstance = axios.create({
    baseURL: publicRuntimeConfig.backendUrl,
});

instance.interceptors.request.use(
    async (config) => {
        if (!config) {
            throw new Error("[Request Header] config가 없습니다");
        }
        if (!config.headers) {
            throw new Error("헤더가 없습니다.");
        }

        const token = localStorage.getItem("token");

        if (!token || token === "") {
            throw new Error("인증 토큰이 없습니다");
        }

        config.headers.Authorization = `Bearer ${token}`;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export async function login(username: string, password: string) {
    return await beforeAuthInstance.post("/auth/login", {
        username,
        password,
    });
}
