import { plainToClass } from 'class-transformer';

export interface Type<T> extends Function {
    new (...args: any[]): T;
    name: string;
}

export function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase());
}

export function camelToSnake(str: string): string {
    return str.replace(
        /[A-Z]/g,
        (match, offset) => (offset === 0 ? '' : '_') + match.toLowerCase(),
    );
}

export function isObjectEmpty(obj: Record<string, any>): boolean {
    for (const key in obj) {
        if (obj[key] !== null && obj[key] !== undefined) {
            return false;
        }
    }

    return true;
}

/**
 * @class EntityBuilder
 * @description
 * 타입을 지정하면 속성의 자동 추론이 가능합니다.
 */
export class EntityBuilder {
    static of<T>(clsRef: Type<T>, entity: Partial<T>) {
        return plainToClass(clsRef, entity);
    }

    static take<T>(
        clsRef: Type<T>,
        property: string,
        entity: Record<string, any>,
    ) {
        const result = {} as Record<string, any>;

        const keys = Object.keys(entity);

        keys.forEach((k) => {
            if (!k.startsWith(property)) {
                return;
            }

            result[snakeToCamel(k.replace(property, ''))] = entity[k];
        });

        const ref = new clsRef();
        Object.assign(ref as any, result);

        return ref;
    }

    static takeAll<T>(
        clsRef: Type<T>,
        entity: Record<string, any>,
        children: Type<any>[],
    ) {
        const childrenNames = children.map((c) => camelToSnake(c.name) + '_');

        const result = {} as Record<string, any>;

        const keys = Object.keys(entity);

        keys.forEach((k) => {
            for (const childName of childrenNames) {
                if (k.startsWith(childName)) {
                    return;
                }
            }

            result[snakeToCamel(k)] = entity[k];
        });

        childrenNames.forEach((k, i) => {
            const clazzName = snakeToCamel(k).slice(0, -1);

            result[clazzName] = EntityBuilder.take(children[i], k, entity);
        });

        const ref = new clsRef();
        Object.assign(ref as any, result);

        return ref;
    }

    static group<T>(
        clsRef: Type<T>,
        entity: Record<string, any>,
        children: Record<string, Type<any> | [Type<any>]>,
    ) {
        const childrenNames = Object.keys(children);

        const result = {} as Record<string, any>;

        const keys = Object.keys(entity);

        keys.forEach((k) => {
            for (const childName of childrenNames) {
                if (k.startsWith(childName)) {
                    return;
                }
            }

            result[snakeToCamel(k)] = entity[k];
        });

        childrenNames.forEach((k, i) => {
            const clazzName = snakeToCamel(k).slice(0, -1);

            result[clazzName] = EntityBuilder.take(
                children[k] as Type<any>,
                k,
                entity,
            );

            if (isObjectEmpty(result[clazzName])) {
                delete result[clazzName];
            }
        });

        const ref = new clsRef();
        Object.assign(ref as any, result);

        return ref;
    }
}
