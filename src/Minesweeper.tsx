import React, { useCallback, useEffect, useMemo } from "react";
import Borders from "./Borders";
import Cell from "./Cell";
import "./Minesweeper.scss";
import {
    Action,
    actionFactory,
    ActionType,
    allBombsFlagged,
    createIsActionType,
    createRemoveAction,
} from "./util/action";
import { addIfNotNull, count } from "./util/array";
import {
    createClearClick,
    generateBoard,
    isBomb,
    openFactory,
    surroundingSquares,
} from "./util/board";
import { className, either, preventDefault } from "./util/functions";
import match from "./util/functions/match";
import { getStoredState, useStoredState } from "./util/storedState";

export enum GameState {
    NOT_STARTED,
    STARTED,
    WON,
    LOST,
}

export interface GameContext {
    board: number[][];
    actions: Action[];
    state: GameState;
}

const Minesweeper: React.FC<{}> = () => {
    const width = getStoredState("width", 16);
    const height = getStoredState("height", 16);
    const mines = getStoredState("mines", 15);

    const [board, setBoard, clearStoredBoard] = useStoredState(
        "board",
        generateBoard(width, height, mines),
    );

    const [actions, setActions, clearStoredActions] = useStoredState<Action[]>(
        "actions",
        [],
    );

    const [state, setState, clearStoredState] = useStoredState(
        "state",
        GameState.NOT_STARTED,
    );

    const clearStorage = useCallback(() => {
        clearStoredBoard();
        clearStoredActions();
        clearStoredState();
    }, [clearStoredActions, clearStoredBoard, clearStoredState]);

    const context: GameContext = useMemo(
        () => ({
            board,
            setBoard,
            actions,
            setActions,
            state,
            setState,
        }),
        [actions, board, setActions, setBoard, setState, state],
    );

    useEffect(() => {
        match(state).on(
            either<GameState>(GameState.LOST, GameState.WON),
            clearStorage,
        );
    }, [state, clearStorage]);

    useEffect(() => {
        if (allBombsFlagged(board, actions)) setState(GameState.WON);
    }, [actions, board, setState]);

    const is = useMemo(() => createIsActionType(actions), [actions]);
    const isFlagged = useMemo(() => is(ActionType.FLAG), [is]);
    const isOpen = useMemo(() => is(ActionType.OPEN), [is]);

    const createLeftClickHandler = useCallback(
        (x: number, y: number) => () => {
            const newActions: Array<Action> = [];
            const open = openFactory(board, actions);

            match(state)
                .on(GameState.NOT_STARTED, () => {
                    setBoard(createClearClick(board, 1)(x, y));
                    setState(GameState.STARTED);
                })
                .on(
                    either<GameState>(GameState.STARTED, GameState.NOT_STARTED),
                    () => {
                        if (!isFlagged(x, y)) {
                            newActions.push(...open(x, y));

                            if (isBomb(x, y)(board)) {
                                setState(GameState.LOST);
                            }
                        }
                    },
                );

            const dontOpenFlagged = ({ x, y, type }: Action) =>
                type === ActionType.OPEN && !isFlagged(x, y);

            setActions([...actions, ...newActions.filter(dontOpenFlagged)]);
        },
        [actions, board, isFlagged, setActions, setBoard, setState, state],
    );

    const createRightClickHandler = useCallback(
        (x: number, y: number) => () => {
            const createFlagAction = actionFactory(actions, ActionType.FLAG);

            match(state)
                .on(GameState.NOT_STARTED, () => {
                    const leftClick = createLeftClickHandler(x, y);
                    leftClick();
                })
                .on(GameState.STARTED, () => {
                    if (isFlagged(x, y)) {
                        const removeFlag = createRemoveAction(ActionType.FLAG);
                        setActions(removeFlag(actions, x, y));
                    } else if (!isOpen(x, y)) {
                        setActions(
                            addIfNotNull(actions, createFlagAction({ x, y })),
                        );
                    }
                });
        },
        [actions, createLeftClickHandler, isFlagged, isOpen, setActions, state],
    );

    const createMiddleClickHandler = useCallback(
        (x: number, y: number) => () => {
            const newActions: Array<Action> = [];
            const open = openFactory(board, actions);

            if (isOpen(x, y)) {
                const surrounding = surroundingSquares(board)(x, y);

                const flagged = count(surrounding)(({ x, y }) =>
                    isFlagged(x, y),
                );

                if (flagged === board[y][x]) {
                    surrounding
                        .filter(({ x, y }) => !isOpen(x, y) && !isFlagged(x, y))
                        .forEach(({ x, y }) => {
                            if (isBomb(x, y)(board)) {
                                setState(GameState.LOST);
                            }
                            newActions.push(...open(x, y));
                        });
                }
            }

            setActions([...actions, ...newActions]);
        },
        [actions, board, isFlagged, isOpen, setActions, setState],
    );

    return (
        <Borders>
            <table
                id="Minesweeper"
                onContextMenu={preventDefault}
                className={className({ lost: state === GameState.LOST })}
            >
                <tbody>
                    {board.map((row, y) => (
                        <tr key={y}>
                            {row.map((value, x) => (
                                <Cell
                                    context={context}
                                    x={x}
                                    y={y}
                                    onLeftClick={createLeftClickHandler(x, y)}
                                    onRightClick={createRightClickHandler(x, y)}
                                    onMiddleClick={createMiddleClickHandler(
                                        x,
                                        y,
                                    )}
                                    key={x}
                                />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </Borders>
    );
};

export default Minesweeper;
