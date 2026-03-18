import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./components/Button";
import "./Settings.scss";
import { call, className } from "./util/functions";
import match from "./util/functions/match";
import { useStoredState } from "./util/storedState";

enum Difficulty {
    Beginner = "beginner",
    Intermediate = "intermediate",
    Expert = "expert",
    Custom = "custom",
}

enum BoardSize {
    Small = "small",
    Medium = "medium",
    Huge = "huge",
    Custom = "custom",
}

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

const handleChange =
    (setValue: SetState<any>, process = (x: any) => x) =>
    (event: React.ChangeEvent<any>) =>
        setValue(process(event.target.value));

const createSizeInput = (
    value: number,
    setValue: SetState<number>,
    max: number = 30,
) => (
    <input
        type="number"
        min={1}
        max={max}
        autoComplete="off"
        value={value}
        onChange={handleChange(setValue, Number)}
    />
);

const Settings: React.FC = () => {
    const navigate = useNavigate();

    const [difficulty, setDifficulty] = useStoredState(
        "difficulty",
        Difficulty.Intermediate,
    );
    const [size, setSize] = useStoredState("size", BoardSize.Medium);

    const selectDifficulty = (i: Difficulty) => () => setDifficulty(i);
    const selectSize = (s: BoardSize) => () => setSize(s);

    const [width, setWidth] = useStoredState("width", 16);
    const [height, setHeight] = useStoredState("height", 16);
    const [mines, setMines] = useStoredState("mines", 20);

    const dimensions = useCallback(
        (width: number, height: number) => {
            setWidth(width);
            setHeight(height);
        },
        [setWidth, setHeight],
    );

    useEffect(() => {
        match(difficulty)
            .on(Difficulty.Beginner, () => setMines(12))
            .on(Difficulty.Intermediate, () => setMines(16))
            .on(Difficulty.Expert, () => setMines(22));
    }, [difficulty, setMines]);

    useEffect(() => {
        match(size)
            .on(BoardSize.Small, () => dimensions(9, 9))
            .on(BoardSize.Medium, () => dimensions(15, 15))
            .on(BoardSize.Huge, () => dimensions(24, 18));
    }, [dimensions, size]);

    return (
        <div className="Settings">
            <div className="close" onClick={call(navigate, "/")}></div>

            <h1>Difficulty</h1>

            <div className="buttons">
                {(Object.values(Difficulty) as Difficulty[]).map((name) => (
                    <Button
                        className={className({ selected: difficulty === name })}
                        onClick={selectDifficulty(name)}
                        key={name}
                    >
                        {name}
                    </Button>
                ))}
            </div>

            {difficulty === Difficulty.Custom && (
                <div className="container">
                    <input
                        type="range"
                        min={1}
                        max={99}
                        value={mines}
                        onChange={handleChange(setMines, Number)}
                    />

                    <p>{mines}% mines</p>
                </div>
            )}

            <h1>Size</h1>

            <div className="buttons">
                {(Object.values(BoardSize) as BoardSize[]).map((name) => (
                    <Button
                        className={className({ selected: size === name })}
                        onClick={selectSize(name)}
                        key={name}
                    >
                        {name}
                    </Button>
                ))}
            </div>

            {size === BoardSize.Custom && (
                <div className="container">
                    <div className="col">
                        <p>Width</p>
                        {createSizeInput(width, setWidth, 24)}
                    </div>
                    <div className="col">
                        <p>Height</p>
                        {createSizeInput(height, setHeight, 18)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
