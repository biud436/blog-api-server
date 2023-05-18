export interface CommandImpl {
    execute(args: string[]): void;
}

/**
 * @public
 */
export const TerminalList = {
    DB_HOST: '1) DB_HOST',
    DB_PASSWORD: '2) DB_PASSWORD',
    DB_USER: '3) DB_USER',
    DB_NAME: '4) DB_NAME',
    DB_PORT: '5) DB_PORT',
    DOCS_USERNAME: '6) DOCS_USERNAME',
    DOCS_PASSWORD: '7) DOCS_PASSWORD',
    JWT_SECRET: '8) JWT_SECRET',
    JWT_SECRET_EXPIRATION_TIME: '9) JWT_SECRET_EXPIRATION_TIME',
    JWT_REFRESH_TOKEN_SECRET: '10) JWT_REFRESH_TOKEN_SECRET',
    JWT_REFRESH_TOKEN_EXPIRATION_TIME: '11) JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    PUBLIC_SERVER_IP: '12) PUBLIC_SERVER_IP',
    PASSWORD_JWT_SECRET: '13) PASSWORD_JWT_SECRET',
    MAIL_XOR_KEY: '14) MAIL_XOR_KEY',
    GMAIL_USERNAME: '15) GMAIL_USERNAME',
    GMAIL_PASSWORD: '16) GMAIL_PASSWORD',
    DAUM_USERNAME: '17) DAUM_USERNAME',
    DAUM_PASSWORD: '18) DAUM_PASSWORD',
    NAVER_USERNAME: '19) NAVER_USERNAME',
    NAVER_PASSWORD: '20) NAVER_PASSWORD',
};

/**
 * @private
 * @interface IEnvFile
 */
export type IEnvFile = typeof TerminalList;
export type IEnvFileTypeMap = keyof typeof TerminalList;

export type MailAccountPasswordOfMap = Extract<
    IEnvFileTypeMap,
    'GMAIL_PASSWORD' | 'DAUM_PASSWORD' | 'NAVER_PASSWORD'
>;
