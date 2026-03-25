import { useMemo } from "react";
import dMinus from "../assets/7segment/d-.svg";
import d0 from "../assets/7segment/d0.svg";
import d1 from "../assets/7segment/d1.svg";
import d2 from "../assets/7segment/d2.svg";
import d3 from "../assets/7segment/d3.svg";
import d4 from "../assets/7segment/d4.svg";
import d5 from "../assets/7segment/d5.svg";
import d6 from "../assets/7segment/d6.svg";
import d7 from "../assets/7segment/d7.svg";
import d8 from "../assets/7segment/d8.svg";
import d9 from "../assets/7segment/d9.svg";

const DIGITS = [d0, d1, d2, d3, d4, d5, d6, d7, d8, d9];

const getDigitImage = (digit: string) => {
    if (digit === "-") {
        return dMinus;
    }

    return DIGITS[Number(digit)];
};

export type SevenSegmentProps = {
    value: number;
} & React.HTMLAttributes<HTMLDivElement>;

export const SevenSegment: React.FC<SevenSegmentProps> = ({
    value,
    style,
    ...props
}) => {
    const digits = useMemo(() => {
        if (value < 0) {
            return ["-", "-", "-"];
        }

        if (value > 999) {
            return ["9", "9", "9"];
        }

        return value.toString().padStart(3, "0").split("");
    }, [value]);

    return (
        <div
            className="SevenSegment"
            style={{
                backgroundColor: "black",
                padding: 5,
                gap: 5,
                display: "flex",
                ...style,
            }}
            {...props}
        >
            <img src={getDigitImage(digits[0])} style={{ height: "100%" }} />
            <img src={getDigitImage(digits[1])} style={{ height: "100%" }} />
            <img src={getDigitImage(digits[2])} style={{ height: "100%" }} />
        </div>
    );
};
