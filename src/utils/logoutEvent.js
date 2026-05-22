class LogoutEvent {
    constructor() {
        this.listeners = [];
    }

    subscribe(fn) {
        this.listeners.push(fn);
    }

    dispatch() {
        this.listeners.forEach(fn => fn());
    }
}

export const logoutEvent = new LogoutEvent();