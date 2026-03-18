import React, { useEffect, useState } from "react";

const encode = (data: string) => btoa(data);
const decode = (data: string) => atob(data);

const parse = (data: string) => {
    try {
        return JSON.parse(data);
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const useStoredState = <T>(
    name: string,
    initialValue: T | (() => T),
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] => {
    const storedName = encode(name);
    const stored = localStorage.getItem(storedName);

    const [state, setState] = useState<T>(
        stored ? parse(decode(stored)) || initialValue : initialValue,
    );

    useEffect(() => {
        localStorage.setItem(storedName, encode(JSON.stringify(state)));
    }, [storedName, state]);

    const clearState = () => {
        localStorage.removeItem(storedName);
    };

    return [state, setState, clearState];
};

export const getStoredState = <T>(name: string, fallback: T): T => {
    const item = localStorage.getItem(encode(name));

    if (item !== null) {
        return parse(decode(item));
    }

    return fallback;
};
