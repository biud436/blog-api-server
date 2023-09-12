export const INJECT_QUERYRUNNER_TOKEN = 'INJECT_QUERYRUNNER:metadata';

/**
 * @author 어진석(biud436)
 * @returns
 */
export function InjectQueryRunner(): ParameterDecorator {
    return (target, propertyKey, index) => {
        const methodName = propertyKey as string;

        Reflect.defineMetadata(
            INJECT_QUERYRUNNER_TOKEN,
            index,
            target,
            methodName,
        );
    };
}
