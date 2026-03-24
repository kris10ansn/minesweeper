import React from "react";
import "./Borders.scss";

export type BordersProps = {
    children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

const Borders: React.FC<BordersProps> = ({ children, ...props }) => {
    return (
        <div className="Borders" {...props}>
            <div className="content">{children}</div>
        </div>
    );
};

export default Borders;
