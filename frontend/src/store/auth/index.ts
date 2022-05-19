import { atom, RecoilValueReadOnly, selector } from 'recoil';
import axios, { AxiosResponse } from 'axios';
import * as validator from 'class-validator';

// ! ATOM

export const signUpParameter = atom({
  key: 'signUpParameter',
  default: {
    username: '',
    password: '',
    email: '',
  },
});

export const verifyAuthCode = atom({
  key: 'verifyAuthCode',
  default: {
    email: '',
    authCode: '',
  },
});

// ! TYPES

export type SignUpDto = {
  username: string;
  password: string;
  email: string;
};

export type AvailableEmailList =
  | `${string}@gmail.com`
  | `${string}@hanmail.net`
  | `${string}@naver.com`
  | `${string}@nate.com`
  | `${string}@daum.net`
  | `${string}@kakao.com`;

export type EmailAddress = `${AvailableEmailList}`;

export type VerifyAuthCodeRequestDto = {
  email: EmailAddress;
  authCode: string;
};

// ! EXPORT UNIQNUE KEYS

export const AUTH_API_KEYS = {
  VERIFY_AUTH_CODE: Symbol.for('VERIFY_AUTH_CODE'),
  AUTH_SIGNUP: Symbol.for('AUTH_SIGNUP'),
};

export type IAUTH_API = {
  [key in keyof typeof AUTH_API_KEYS]: RecoilValueReadOnly<
    AxiosResponse<any, any>
  >;
};

// ! EXPOSE API

export const AUTH_API = <IAUTH_API>{
  [AUTH_API_KEYS.VERIFY_AUTH_CODE]: selector({
    key: 'verifyAuthCode',
    get: async ({ get }) => {
      const { email, authCode } = get(verifyAuthCode);

      if (!validator.isEmail(email)) {
        throw new Error('잘못된 이메일 형식입니다.');
      }

      const res = await axios.post('/auth/verify-auth-code', {
        authCode,
        email,
      } as VerifyAuthCodeRequestDto);

      return res;
    },
  }),
  [AUTH_API_KEYS.AUTH_SIGNUP]: selector({
    key: 'authSign',
    get: async ({ get }) => {
      const { username, password, email } = get(signUpParameter);

      if (!validator.isEmail(email)) {
        throw new Error('잘못된 이메일 형식입니다.');
      }

      const res = await axios.post('/auth/signup', {
        username,
        password,
        email,
      } as SignUpDto);

      return res;
    },
  }),
};
