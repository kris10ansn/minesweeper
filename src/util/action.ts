import { Coordinates } from "./board";

export enum ActionType {
    FLAG,
    OPEN,
}

export interface Action {
    type: ActionType;
    x: number;
    y: number;
}

export const actionEquals = (action1: Action) => (action2: Action) =>
    action1.type === action2.type &&
    action1.x === action2.x &&
    action1.y === action2.y;

export const actionNotEquals = (action1: Action) => (action2: Action) =>
    !actionEquals(action1)(action2);

export const getLastAction = (actions: Action[], actionType: ActionType) =>
    actions.filter(({ type }) => type === actionType).slice(-1)[0];

export const uniqueAction = (actions: Action[], action: Action) =>
    !actions.find(actionEquals(action));

export const actionFactory =
    (actions: Action[], type: ActionType) =>
    ({ x, y }: Coordinates): Action | null => {
        const action = { x, y, type };

        return uniqueAction(actions, action) ? action : null;
    };

export const createIsActionType =
    (actions: Action[]) =>
    (type: ActionType) =>
    (x: number, y: number): boolean =>
        !uniqueAction(actions, { x, y, type });

export const createRemoveAction =
    (type: ActionType) => (actions: Action[], x: number, y: number) =>
        actions.filter(actionNotEquals({ x, y, type }));

export const allBombsFlagged = (board: number[][], actions: Action[]) => {
    const is = createIsActionType(actions);

    const isFlagged = is(ActionType.FLAG);
    const isOpen = is(ActionType.OPEN);

    return board.every((row, y) =>
        row.every(
            (value, x) =>
                (value === -1 && isFlagged(x, y)) ||
                (value > -1 && isOpen(x, y)),
        ),
    );
};
