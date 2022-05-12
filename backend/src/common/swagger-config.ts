import { AuthController } from 'src/domain/auth/auth.controller';
import { PostsController } from 'src/domain/posts/posts.controller';
import { CreatePostDto } from 'src/entities/post/dto/create-post.dto';

/**
 * @author 어진석
 */

export type ApiOperationData = {
    summary: string;
    description: string;
    requestBody?: any;
};

export type ApiOkResponseDescriptor = {
    operation: ApiOperationData;
    description: string;
    auth?: boolean;
    basicAuth?: boolean;
    requestBody?: any;
    type?: any;
    schema?: any;
};

export type HttpMethod = {
    _get: 'GET';
    _post: 'POST';
    _put: 'PUT';
    _delete: 'DELETE';
    _patch: 'PATCH';
    _options: 'OPTIONS';
    _head: 'HEAD';
};

export type DefaultMapper<T> = {
    [key in keyof Partial<HttpMethod>]: {
        [key in keyof Partial<T>]: ApiOkResponseDescriptor;
    };
};

export type DefaultMapperWithoutHttpMethod<T> = {
    [key in keyof Partial<T>]: ApiOkResponseDescriptor;
};

export namespace DocsMapper {
    export const auth: DefaultMapper<AuthController> = {
        _post: {
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
            sendAuthCodeByEmail: {
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

    const GET = Symbol.for('get');

    export const posts: DefaultMapper<PostsController> = {
        _get: {
            findOne: {
                operation: {
                    summary: '특정 포스트 조회',
                    description: '특정 포스트를 조회합니다.',
                },
                auth: false,
                description: '특정 포스트를 조회합니다.',
            },
            findAll: {
                operation: {
                    summary: '포스트 목록 가져오기',
                    description: '포스트 목록을 가져옵니다.',
                },
                auth: false,
                description: '포스트 목록을 가져옵니다.',
            },
        },
        _patch: {
            update: {
                operation: {
                    summary: '특정 포스트 수정',
                    description: '특정 포스트를 수정합니다.',
                },
                auth: true,
                description: '특정 포스트를 수정합니다.',
            },
        },
        _delete: {
            remove: {
                operation: {
                    summary: '특정 포스트 삭제',
                    description: '특정 포스트를 삭제합니다.',
                },
                auth: true,
                description: '특정 포스트를 삭제합니다.',
            },
        },
        _post: {
            create: {
                operation: {
                    summary: '새로운 포스트 작성',
                    description: '새로운 포스트를 작성합니다',
                },
                description: '새로운 포스트를 작성합니다',
                auth: true,
                type: CreatePostDto,
            },
        },
    };
}
