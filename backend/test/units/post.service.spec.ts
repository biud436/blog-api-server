import { describe, it, expect, beforeEach } from '@jest/globals';
import { RedisService } from 'src/common/micro-services/redis/redis.service';
import { Post } from 'src/entities/post/entities/post.entity';
import { PostService } from 'src/entities/post/post.service';
import { Repository } from 'typeorm';
import {
    createMockQueryBuilder,
    createMockQueryBuilderValue,
} from '../utils/mock-query-builder';
import { instance, mock, when } from '@johanblumenberg/ts-mockito';
import { Image } from 'src/controllers/image/entities/image.entity';
import { User } from 'src/entities/user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/entities/user/user.service';
import { PaginationProvider } from 'src/common/modules/pagination/pagination-repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryService } from 'src/entities/category/category.service';
import { ImageService } from 'src/controllers/image/image.service';
import { CategoryRepository } from 'src/entities/category/entities/category.repository';
import { ImageCreateCommandImpl } from 'src/controllers/image/commands/image-create.command';
import { ImageTempFileGetterCommandImpl } from 'src/controllers/image/commands/image-temp.command';
import { ImageFindByIdCommandImpl } from 'src/controllers/image/commands/image-find-by-id.command';
import { ImageUpdatePostIdCommandImpl } from 'src/controllers/image/commands/image-update-post-id.command';
import { ImageUploadCommandImpl } from 'src/controllers/image/commands/image-upload.command';
import { ImageDeleteCommandImpl } from 'src/controllers/image/commands/image-delete.command';
import { S3Service } from 'src/common/micro-services/s3/s3.service';
import {
    S3DeleteBucketCommand,
    S3DeleteBucketCommandImpl,
} from 'src/common/micro-services/s3/s3.delete-bucket.command';
import 'reflect-metadata';

describe('PostSevice Unit Test', () => {
    // Services
    let postService: PostService;
    let configService: ConfigService;
    let redisService: RedisService;

    // Repositories
    let postRepository: Repository<Post>;
    let categoryRepository: CategoryRepository;
    let imageRepository: Repository<Image>;
    let userRepository: Repository<User>;

    // QueryBuilders
    let mockPostQueryBuilder: any;
    let mockCategoryQueryBuilder: any;
    let mockImageQueryBuilder: any;
    let mockUserQueryBuilder: any;

    // Mocks 생성
    beforeEach(() => {
        mockPostQueryBuilder = createMockQueryBuilder();
        mockCategoryQueryBuilder = createMockQueryBuilder();
        mockImageQueryBuilder = createMockQueryBuilder();
        mockUserQueryBuilder = createMockQueryBuilder();

        postRepository = mock(Repository);
        categoryRepository = mock(CategoryRepository);
        imageRepository = mock(Repository);
        userRepository = mock(Repository);
        redisService = mock(RedisService);

        // ConfigService Mock
        const configServiceMock = mock(ConfigService);
        when(
            configServiceMock.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        ).thenReturn('access_key');
        when(
            configServiceMock.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
        ).thenReturn('secret_key');
        when(
            configServiceMock.getOrThrow<string>('AWS_S3_BUCKET_NAME'),
        ).thenReturn('bucket_name');
        when(configServiceMock.getOrThrow<string>('REDIS_HOST')).thenReturn(
            'localhost',
        );
        when(configServiceMock.getOrThrow<number>('REDIS_PORT')).thenReturn(
            6379,
        );

        configService = instance(configServiceMock);
    });

    // DI Container 생성
    beforeEach(async () => {
        /**
         * 실제 환경에서는 여러 모듈의 프로바이더에서 DI 대상을 가져오지만,
         * 테스트 환경에서는 기작성된 모듈을 불러오는 것보다,
         * 테스트 모듈의 프로바이더 설정을 직접 해주는 것이 속편하다.
         *
         * 상당한 보일러 플레이트가 발생하므로 자동화할 필요성이 있다.
         *
         * 테스트 환경에서는 아래와 같이,
         * design:paramtypes를 이용하여 생성자에 주입될 매개변수의 타입을 가져와 자동화할 수도 있다.
         * 하지만 모든 경우에 대해 자동화할 수는 없다.
         */
        const types = Reflect.getMetadata('design:paramtypes', PostService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostService,
                CategoryService,
                UserService,
                RedisService,
                ImageService,
                {
                    provide: ConfigService,
                    useValue: configService,
                },
                PaginationProvider,
                {
                    provide: getRepositoryToken(Post),
                    useValue: createMockQueryBuilderValue(
                        mockPostQueryBuilder,
                        () => instance(postRepository),
                    ),
                },
                {
                    provide: CategoryRepository,
                    useValue: createMockQueryBuilderValue(
                        mockCategoryQueryBuilder,
                        () => instance(categoryRepository),
                    ),
                },
                {
                    provide: getRepositoryToken(Image),
                    useValue: createMockQueryBuilderValue(
                        mockImageQueryBuilder,
                        () => instance(imageRepository),
                    ),
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: createMockQueryBuilderValue(
                        mockUserQueryBuilder,
                        () => instance(userRepository),
                    ),
                },
                ImageCreateCommandImpl,
                ImageTempFileGetterCommandImpl,
                ImageFindByIdCommandImpl,
                ImageUpdatePostIdCommandImpl,
                ImageUploadCommandImpl,
                ImageDeleteCommandImpl,
                S3Service,
                {
                    provide: S3DeleteBucketCommand,
                    useClass: S3DeleteBucketCommandImpl,
                },
            ],
        }).compile();

        redisService = module.get<RedisService>(RedisService);
        postService = module.get<PostService>(PostService);

        postRepository = module.get<Repository<Post>>(getRepositoryToken(Post));
        categoryRepository = module.get<CategoryRepository>(CategoryRepository);
        imageRepository = module.get<Repository<Image>>(
            getRepositoryToken(Image),
        );
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));

        mockPostQueryBuilder = postRepository.createQueryBuilder();
        mockCategoryQueryBuilder = categoryRepository.createQueryBuilder();
        mockImageQueryBuilder = imageRepository.createQueryBuilder();
        mockUserQueryBuilder = userRepository.createQueryBuilder();
    });

    it('정의되었는지 확인', () => {
        expect(postService).toBeDefined();
        expect(postRepository).toBeDefined();
        expect(categoryRepository).toBeDefined();
        expect(imageRepository).toBeDefined();
        expect(userRepository).toBeDefined();
    });

    describe('findOne', () => {
        it('포스트를 반환한다.', async () => {
            // Given
            const mockWorkRecord: Partial<Post> = {
                id: 1,
                authorId: 1,
                categoryId: 1,
                isPrivate: false,
                title: 'title',
                content: 'content',
                uploadDate: new Date(),
            };

            mockPostQueryBuilder.getOneOrFail.mockResolvedValue(mockWorkRecord);

            // When
            const result = await postService.findOne(1);

            // Then
            expect(mockPostQueryBuilder.andWhere).toBeCalledWith(
                'post.id = :postId',
                { postId: 1 },
            );
            expect(result.id).toBe(1);
        });
    });
});
