import { browser } from 'webextension-polyfill-ts';
export namespace Storage {
    export interface Storage {
        workspaces: Workspace[];
        sessions: Session[];
    }

    export interface Workspace {
        urls: string[];
        name: string;
    }

    export interface Session {}

    // initialise an empty storage structure in the browser's extensionStorage
    export const initStorage = () => {
        browser.storage.local.set(Storage);
    };
}
