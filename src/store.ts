export interface Store<S> {
    getState: () => S;
    canUndo: () => boolean;
    historySize: () => number;
    subscribe: (listener: (state: S) => void) => void;
    setState: (next: S) => boolean;
    undo: () => boolean;
}

export function createStore<S>(initialState: S): Store<S> {
    let state: S = initialState;
    let history: S[] = [];
    const listeners: Array<(state: S) => void> = [];

    function notify(): void {
        listeners.forEach((listener) => listener(state));
    }

    return {
        getState: () => state,
        canUndo: () => history.length > 0,
        historySize: () => history.length,
        subscribe(listener: (state: S) => void): void {
            listeners.push(listener);
        },
        setState(next: S): boolean {
            if (next === state) {
                return false;
            }

            history = [...history, state];
            state = next;
            notify();
            return true;
        },
        undo(): boolean {
            if (history.length === 0) {
                return false;
            }

            state = history[history.length - 1] as S;
            history = history.slice(0, -1);
            notify();
            return true;
        }
    };
}
