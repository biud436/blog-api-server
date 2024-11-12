import { jest } from '@jest/globals';

export function createMockQueryBuilder() {
    return {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn<() => any>().mockResolvedValue([]),
        getRawOne: jest.fn<() => any>().mockResolvedValue({}),
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        execute: jest.fn<() => any>().mockResolvedValue({}),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        getMany: jest.fn<() => any>().mockResolvedValue([]),
    };
}

export function createMockQueryBuilderValue<
    T extends ReturnType<typeof createMockQueryBuilder>,
>(mockQueryBuilder: T, targetFunc?: () => any) {
    return {
        ...targetFunc?.(),
        create: jest.fn().mockReturnValue({}),
        save: jest.fn<() => any>().mockResolvedValue({}),
        findOne: jest.fn<() => any>().mockResolvedValue({}),
        find: jest.fn<() => any>().mockResolvedValue([]),
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };
}
