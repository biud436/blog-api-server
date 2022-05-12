export namespace DocsMapper {
    export const auth = {
        post: {
            login: {
                operation: {
                    summary: '로그인',
                    description: '로그인을 처리합니다.',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        username: { type: 'string' },
                                        password: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                },
                description: '로그인 성공시 토큰을 반환합니다.',
                basicAuth: true,
            },
            sendAuthCode: {
                operation: {
                    summary: '이메일로 인증 코드 전송',
                    description: '이메일로 인증 코드 6자리를 전송합니다.',
                },
                description: '이메일로 인증 코드 6자리를 전송합니다.',
                auth: false,
            },
            verifyAuthCode: {
                operation: {
                    summary: '인증 코드 확인',
                    description: '인증 코드를 확인합니다.',
                },
                description: '인증 코드를 확인합니다.',
                auth: false,
            },
            signup: {
                operation: {
                    summary: '회원가입',
                    description: '회원가입을 처리합니다.',
                },
                description: '회원가입을 처리합니다.',
                auth: false,
            },
        },
    };
}
