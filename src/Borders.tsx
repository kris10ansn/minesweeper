import React from "react";
import "./Borders.scss";

export type BordersProps = { children: React.ReactNode };

const Borders: React.FC<BordersProps> = ({ children }) => {
    return (
        <div className="Borders">
            <div className="content">{children}</div>
        </div>
    );
};

export default Borders;
