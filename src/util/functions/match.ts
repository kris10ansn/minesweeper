type ConditionFunction<T> = (arg: T) => boolean;

const isConditionFunction = <T>(
    c: T | ConditionFunction<T>,
): c is ConditionFunction<T> => typeof c === "function";

interface MatchObject<T, F = (arg: T) => any> {
    on: (condition: T | ConditionFunction<T>, fn: F) => MatchObject<T>;
    otherwise: (fn: F) => any;
}

const match = <T>(x: T): MatchObject<T> => ({
    on: (condition, fn) => {
        if (
            (isConditionFunction(condition) && condition(x)) ||
            x === condition
        ) {
            fn(x);
        }

        return match(x);
    },
    otherwise: (fn) => fn(x),
});

export default match;
