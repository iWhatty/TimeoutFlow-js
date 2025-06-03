/**
 * Creates a fluent scheduler.
 * Returns a chainable timeline.
 */
export function flow(): {
    after(duration: any, fn: any): /*elided*/ any;
    every(duration: any, fn: any, times?: number): /*elided*/ any;
    loop(n?: boolean): /*elided*/ any;
    onFinish(cb: any): /*elided*/ any;
    start(): /*elided*/ any;
    pause(): void;
    resume(): void;
    cancel(): void;
    reset(): /*elided*/ any;
    readonly isPaused: boolean;
    label(name: any): /*elided*/ any;
    jumpTo(name: any): /*elided*/ any;
    if(predicate: any): /*elided*/ any;
    unless(predicate: any): /*elided*/ any;
    while(predicate: any): /*elided*/ any;
    doWhile(predicate: any): /*elided*/ any;
};
