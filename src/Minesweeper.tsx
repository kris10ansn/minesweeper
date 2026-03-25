import React, { useCallback, useEffect, useMemo, useRef } from "react";
import dead from "./assets/smileys/dead.svg";
import smile from "./assets/smileys/smile.svg";
import sunglasses from "./assets/smileys/sunglasses.svg";
import Borders from "./Borders";
import Cell from "./Cell";
import Button from "./components/Button";
import { SevenSegment } from "./components/SevenSegment";
import "./Minesweeper.scss";
import {
    Action,
    actionFactory,
    ActionType,
    allBombsFlagged,
    createIsActionType,
    createRemoveAction,
} from "./util/action";
import { addIfNotNull, count, flatten } from "./util/array";
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
    const bordersRef = useRef<HTMLDivElement>(null);

    const width = getStoredState("width", 16);
    const height = getStoredState("height", 16);
    const minesPercent = getStoredState("mines", 15);

    const [board, setBoard, clearStoredBoard] = useStoredState(
        "board",
        generateBoard(width, height, minesPercent),
    );

    const [actions, setActions, clearStoredActions] = useStoredState<Action[]>(
        "actions",
        [],
    );

    const [state, setState, clearStoredState] = useStoredState(
        "state",
        GameState.NOT_STARTED,
    );

    const [time, setTime, clearStoredTime] = useStoredState("time", 0);

    const clearStorage = useCallback(() => {
        clearStoredBoard();
        clearStoredActions();
        clearStoredState();
        clearStoredTime();
    }, [ clearStoredActions, clearStoredBoard, clearStoredState, clearStoredTime, ]); // prettier-ignore

    const mines = useMemo(
        () => count(flatten(board))((v) => v === -1),
        [actions],
    );

    const flags = useMemo(
        () => count(actions)((action) => action.type === ActionType.FLAG),
        [actions],
    );

    const smiley = useMemo(() => {
        if (state === GameState.WON) return sunglasses;
        if (state === GameState.LOST) return dead;

        return smile;
    }, [state]);

    const reset = useCallback(() => {
        clearStorage();
        location.reload();
    }, [clearStorage]);

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
        const interval = setInterval(() => {
            if (state === GameState.STARTED) {
                setTime((time) => time + 1);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [state]);

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

    const leftClick = (x: number, y: number) => {
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
                    if (isFlagged(x, y)) {
                        return;
                    }

                    newActions.push(...open(x, y));

                    if (isBomb(x, y)(board)) {
                        setState(GameState.LOST);
                    }
                },
            );

        const dontOpenFlagged = ({ x, y, type }: Action) =>
            type === ActionType.OPEN && !isFlagged(x, y);

        setActions([...actions, ...newActions.filter(dontOpenFlagged)]);
    };

    const rightClick = (x: number, y: number) => {
        const createFlagAction = actionFactory(actions, ActionType.FLAG);

        match(state)
            .on(GameState.NOT_STARTED, () => {
                leftClick(x, y);
            })
            .on(GameState.STARTED, () => {
                if (isFlagged(x, y)) {
                    const removeFlag = createRemoveAction(ActionType.FLAG);
                    setActions(removeFlag(actions, x, y));
                } else if (!isOpen(x, y) && flags < mines) {
                    setActions(
                        addIfNotNull(actions, createFlagAction({ x, y })),
                    );
                }
            });
    };

    const middleClick = (x: number, y: number) => {
        const newActions: Array<Action> = [];
        const open = openFactory(board, actions);

        if (isOpen(x, y)) {
            const surrounding = surroundingSquares(board)(x, y);

            const flagged = count(surrounding)(({ x, y }) => isFlagged(x, y));

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
    };

    return (
        <div id="minesweeper-container">
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width:
                        bordersRef.current !== null
                            ? getComputedStyle(bordersRef.current).width
                            : "auto",

                    height: 84,
                }}
            >
                <SevenSegment
                    value={state === GameState.NOT_STARTED ? -1 : mines - flags}
                    style={{ height: "100%" }}
                />
                <Button onClick={reset}>
                    <img
                        src={smiley}
                        width={64}
                        style={{ margin: 0, padding: 0, marginBottom: -5 }}
                    />
                </Button>
                <SevenSegment value={time} style={{ height: "100%" }} />
            </div>
            <Borders ref={bordersRef}>
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
                                        onLeftClick={() => leftClick(x, y)}
                                        onRightClick={() => rightClick(x, y)}
                                        onMiddleClick={() => middleClick(x, y)}
                                        key={x}
                                    />
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Borders>
        </div>
    );
};

export default Minesweeper;
