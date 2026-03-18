import { Action, actionFactory, ActionType } from "./action";
import { area, array2d, flatten, isIndex } from "./array";
import { notNull } from "./functions";
import { pipe } from "./functions/pipe";

export interface Coordinates {
    x: number;
    y: number;
}

export const isBomb = (x: number, y: number) => (board: number[][]) =>
    board[y][x] === -1;

export const validCoordinates =
    (board: number[][]) =>
    ({ x, y }: Coordinates) =>
        isIndex(board)(y) && isIndex(board[0])(x);

export const sameCoordinates =
    <T extends Coordinates>(c1: T) =>
    (c2: T) =>
        c1.x === c2.x && c1.y === c2.y;

export const uniqueCoordinates =
    <T extends Coordinates>(arr: T[]) =>
    (c: T) =>
        !arr.find(sameCoordinates<T>(c));

export const surroundingSquares =
    (board: number[][]) =>
    (
        squareX: number,
        squareY: number,
    ): Array<{ x: number; y: number; value: number }> =>
        flatten(
            area(board)(squareX - 1, squareY - 1, squareX + 1, squareY + 1),
        ).filter(
            ({ x, y }) =>
                (x !== squareX || y !== squareY) &&
                validCoordinates(board)({ x, y }),
        );

export const calculateValue = (board: number[][]) => (x: number, y: number) =>
    board[y][x] === -1
        ? -1
        : surroundingSquares(board)(x, y).filter(({ value }) => value === -1)
              .length;

export const calculateValues = (board: number[][]) =>
    board.map((row, y) => row.map((_, x) => calculateValue(board)(x, y)));

export const addBombsPercent = (percent: number) => (board: number[][]) =>
    board.map((row) =>
        row.map((val) => (Math.random() > (100 - percent) / 100 ? -1 : val)),
    );

export const createClearClick =
    (board: number[][], radius: number) => (clickX: number, clickY: number) => {
        const calc = calculateValue(board);

        const newBoard = board.slice();

        flatten(
            area(newBoard)(
                clickX - radius,
                clickY - radius,
                clickX + radius,
                clickY + radius,
            ),
        )
            .filter(validCoordinates(newBoard))
            .forEach(({ x, y }) => (newBoard[y][x] = 0));

        flatten(
            area(newBoard)(
                clickX - (radius + 1),
                clickY - (radius + 1),
                clickX + (radius + 1),
                clickY + (radius + 1),
            ),
        )
            .filter(validCoordinates(newBoard))
            .forEach(({ x, y }) => (newBoard[y][x] = calc(x, y)));

        return newBoard;
    };

export const createOpenNeighbours =
    (board: number[][]) =>
    (sx: number, sy: number, opened: Array<Coordinates> = []) => {
        surroundingSquares(board)(sx, sy).forEach(({ x, y, value }) => {
            if (
                value !== -1 &&
                !opened.find((it) => it.x === x && it.y === y)
            ) {
                opened.push({ x, y });

                if (value === 0) {
                    const surrounding = createOpenNeighbours(board)(
                        x,
                        y,
                        opened,
                    ).filter(uniqueCoordinates(opened));

                    opened.push(...surrounding);
                }
            }
        });

        return opened;
    };

export const openFactory =
    (board: number[][], actions: Action[]) =>
    (x: number, y: number): Action[] => {
        const openNeighbours = createOpenNeighbours(board);
        const createOpenAction = actionFactory(actions, ActionType.OPEN);

        return [
            ...[createOpenAction({ x, y })].filter(notNull),
            ...(board[y][x] === 0
                ? openNeighbours(x, y).map(createOpenAction).filter(notNull)
                : []),
        ];
    };

export const generateBoard =
    (width: number, height: number, mines: number) => () =>
        pipe(
            addBombsPercent(mines),
            calculateValues,
        )(array2d(width)(height)(0));
