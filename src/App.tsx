import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainMenu from "./MainMenu";
import Minesweeper from "./Minesweeper";
import Settings from "./Settings";
import { getStoredState } from "./util/storedState";

const App: React.FC = () => {
    const gameState = getStoredState("state", null);

    return (
        <BrowserRouter>
            {/* Resume playing if there is a game in progress */}
            {gameState !== null && <Navigate to="/game" />}

            <Routes>
                <Route path="/game" element={<Minesweeper />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/" element={<MainMenu />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
