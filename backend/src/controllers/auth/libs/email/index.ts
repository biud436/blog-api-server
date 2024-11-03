export type AvailableEmailList =
    | `${string}@gmail.com`
    | `${string}@hanmail.net`
    | `${string}@naver.com`
    | `${string}@nate.com`
    | `${string}@daum.net`
    | `${string}@kakao.com`;

export type EmailAddress = `${AvailableEmailList}`;

export const EMAIL_KEYS = [
    'daum.net',
    'gmail.com',
    'hanmail.net',
    'kakao.com',
    'nate.com',
    'naver.com',
];
