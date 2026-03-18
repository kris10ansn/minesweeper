import React from "react";
import {
    Route,
    BrowserRouter as Router,
    Switch,
    useHistory,
} from "react-router-dom";
import MainMenu from "./MainMenu";
import Minesweeper from "./Minesweeper";
import Settings from "./Settings";
import { getStoredState } from "./util/storedState";

// Own component to be able to use the useHistory hook
const SetLocation = () => {
    const history = useHistory();
    const gameState = getStoredState("state", null);

    if (gameState !== null) {
        history.push("/game");
    } else {
        history.push("/");
    }

    return <></>;
};

const App: React.FC = () => {
    return (
        <Router>
            <SetLocation />
            <Switch>
                <Route path="/game">
                    <Minesweeper />
                </Route>
                <Route path="/settings">
                    <Settings />
                </Route>
                <Route exact path="/">
                    <MainMenu />
                </Route>
            </Switch>
        </Router>
    );
};

export default App;
