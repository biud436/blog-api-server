import { plainToClass } from 'class-transformer';

export interface Type<T> extends Function {
    new (...args: any[]): T;
}

export class EntityBuilder {
    static of<T>(clsRef: Type<T>, entity: Partial<T>): T {
        return plainToClass(clsRef, entity);
    }
}
