import { plainToClass } from 'class-transformer';

export interface Type<T> extends Function {
    new (...args: any[]): T;
}

export class EntityBuilder {
    static of<T>(clsRef: Type<T>, entity: T): T {
        return plainToClass(clsRef, entity);
    }
}
