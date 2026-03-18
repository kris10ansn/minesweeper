import { LastElement } from "../array";

type Func = (arg: any) => any;
type ArgType<F, Else = never> = F extends (arg: infer A) => any ? A : Else;

export const pipe =
    <F extends [Func, ...Func[]]>(...functions: F | Func[]) =>
    (arg: ArgType<F[0]>) =>
        functions.reduce((prev, cur) => cur(prev), arg) as ReturnType<
            LastElement<F>
        >;
