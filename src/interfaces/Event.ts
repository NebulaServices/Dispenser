import Bot from '../classes/Bot';

type RunEvent = (client: Bot, ...args: any[]) => Promise<any>;

interface Event {
    name?: string;
    run: RunEvent;
}

export { RunEvent, Event };