import { notNull } from "./functions";

export type Length<T extends any[]> = T extends { length: infer L } ? L : never;
export type DropFirst<T extends any[]> = ((...args: T) => any) extends (
    arg: any,
    ...rest: infer U
) => any
    ? U
    : T;

export type LastElement<T extends any[]> = T[Length<DropFirst<T>>];

export const array = (length: number) => Array<null>(length).fill(null);

export const array2d =
    (width: number) =>
    (height: number) =>
    <T>(value: T): T[][] =>
        Array(height)
            .fill(null)
            .map(() => Array(width).fill(value));

export const flatten = (arr2d: any[][]) =>
    arr2d.reduce((prev, cur) => [...prev, ...cur], []);

export const count =
    <T>(array: T[]) =>
    (callback: (x: T) => boolean): number => {
        let c = 0;
        for (const element of array) {
            if (callback(element)) {
                c += 1;
            }
        }
        return c;
    };

export const isIndex = (arr: any[]) => (i: number) => i >= 0 && i < arr.length;

export const addIfNotNull = <T>(arr: T[], value: T | null) =>
    value === null ? arr : [...arr, value];

export const area =
    (arr: any[][]) => (x1: number, y1: number, x2: number, y2: number) =>
        array(y2 + 1 - y1)
            .map((_, offsetY) => {
                const y = y1 + offsetY;

                if (y < 0 || y >= arr.length) {
                    return null;
                }

                return array(x2 + 1 - x1)
                    .map((_, offsetX) => {
                        const x = x1 + offsetX;

                        if (x < 0 || x > arr[y].length) {
                            return null;
                        }

                        return {
                            x,
                            y,
                            value: arr[y][x],
                        };
                    })
                    .filter(notNull);
            })
            .filter(notNull);
