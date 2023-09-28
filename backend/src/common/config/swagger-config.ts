import { AuthController } from 'src/controllers/auth/auth.controller';
import { PostsController } from 'src/controllers/posts/posts.controller';
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

export type HttpMapping = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

export type DefaultMapper<T> = {
    [key in Partial<HttpMapping[number]>]: {
        [key in keyof Partial<T>]: ApiOkResponseDescriptor;
    };
};

export type DefaultMapperWithoutHttpMethod<T> = {
    [key in keyof Partial<T>]: ApiOkResponseDescriptor;
};

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace DocsMapper {
    export const auth: DefaultMapper<AuthController> = {
        DELETE: {},
        GET: {},
        PATCH: {},
        PUT: {},
        POST: {
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
        },
    };

    export const posts: DefaultMapper<PostsController> = {
        PUT: {},
        GET: {
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
        PATCH: {},
        DELETE: {},
        POST: {
            create: {
                operation: {
                    summary: '새로운 포스트 작성',
                    description: '새로운 포스트를 작성합니다',
                },
                description: '새로운 포스트를 작성합니다',
                auth: true,
            },
        },
    };
}
