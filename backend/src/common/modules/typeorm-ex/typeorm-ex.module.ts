import { DynamicModule, Module, Provider } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TYPEORM_EX_CUSTOM_REPOSITORY } from './typeorm-ex.decorator';

/**
 * This is an improvement to allow @nestjs/typeorm@8.1.x to handle CustomRepository.
 * I won't explain it specifically, but it will help in some way. https://github.com/nestjs/typeorm/pull/1233
 * @link https://gist.github.com/anchan828/9e569f076e7bc18daf21c652f7c3d012
 */
export class TypeOrmExModule {
    public static forCustomRepository<T extends new (...args: any[]) => any>(
        repositories: T[],
    ): DynamicModule {
        const providers: Provider[] = [];

        for (const repository of repositories) {
            const entity = Reflect.getMetadata(
                TYPEORM_EX_CUSTOM_REPOSITORY,
                repository,
            );

            if (!entity) {
                continue;
            }

            providers.push({
                inject: [getDataSourceToken()],
                provide: repository,
                useFactory: (dataSource: DataSource): typeof repository => {
                    // TreeRepository를 지원하도록 수정
                    const metadata = dataSource.getMetadata(entity);
                    const isTreeEntity = metadata.treeType !== undefined;

                    const baseRepository = isTreeEntity
                        ? dataSource.getTreeRepository<any>(entity)
                        : dataSource.getRepository<any>(entity);

                    return new repository(
                        baseRepository.target,
                        baseRepository.manager,
                        baseRepository.queryRunner,
                    );
                },
            });
        }

        return {
            exports: providers,
            module: TypeOrmExModule,
            providers,
        };
    }
}
