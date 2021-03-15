import React from "react";
import { ICell, setupBoard, openSurroundingZeros, isWin } from "./util/board";
import { GameState } from "./Minesweeper";

interface HandleClickFactoryProps {
    gameState: number;
    setGameState: React.Dispatch<React.SetStateAction<number>>;
    board: ICell[][];
    setBoard: React.Dispatch<React.SetStateAction<ICell[][]>>;
    width: number;
    height: number;
    mines: number;
}

export const createHandleClickFactory = ({
    gameState,
    setGameState,
    board,
    setBoard,
    width,
    height,
    mines,
}: HandleClickFactoryProps) => (x: number, y: number, cell: ICell) => (
    event: React.MouseEvent
) => {
    const leftClick = event.button === 0;
    const rightClick = event.button === 2;

    if (gameState === GameState.NOT_STARTED && leftClick) {
        const newBoard = setupBoard({
            width,
            height,
            mines,
            click: { x, y },
        });

        openSurroundingZeros(x, y, newBoard);

        setBoard(newBoard);
        setGameState(GameState.PLAYING);
    }

    if (gameState !== GameState.PLAYING) return;

    const newBoard = board.slice();

    if (leftClick && !cell.flagged) {
        cell.open = true;

        if (cell.value === 0) {
            openSurroundingZeros(x, y, board);
        } else if (cell.value === -1) {
            board.forEach((row) =>
                row.forEach((cell) => {
                    if (cell.value === -1) {
                        cell.open = true;
                    }
                })
            );

            setGameState(GameState.LOSS);
        }
    } else if (rightClick) {
        cell.flagged = !cell.flagged;
    }

    if (isWin(newBoard)) {
        setGameState(GameState.WIN);
    }

    setBoard(newBoard);
};