namespace MyBlogConfigOptions {
    export interface EnvironmentVariables {
        DB_HOST: string;
        DB_PASSWORD: string;
        DB_USER: string;
        DB_NAME: string;
        DB_SESSION_NAME: string;
        DB_PORT: string;
        DOCS_USERNAME: string;
        DOCS_PASSWORD: string;
        JWT_SECRET: string;
        JWT_SECRET_EXPIRATION_TIME: string;
        JWT_REFRESH_TOKEN_SECRET: string;
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: string;
        PUBLIC_SERVER_IP: string;
        PASSWORD_JWT_SECRET: string;
        MAIL_XOR_KEY: string;
        GMAIL_USERNAME: string;
        GMAIL_PASSWORD: string;
        DAUM_USERNAME: string;
        DAUM_PASSWORD: string;
        NAVER_USERNAME: string;
        NAVER_PASSWORD: string;
        AES_256_KEY: string;
        AES_256_IV: string;
        GITHUB_CLIENT_ID: string;
        GITHUB_CLIENT_SECRET: string;
        GITHUB_CALLBACK_URL: string;
        APP_SECRET: string;
        GITHUB_REDIRECT_URI: string;
        AWS_ACCESS_KEY_ID: string;
        AWS_SECRET_ACCESS_KEY: string;
        AWS_S3_BUCKET_NAME: string;
        SLACK_WEBHOOK_URL: string;
        BLOG_URL: string;
        REDIS_HOST: string;
        REDIS_PORT: string;
    }
}

export = MyBlogConfigOptions;
