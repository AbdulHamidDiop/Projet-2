export const MAX_MESSAGE_LENGTH = 200; // 200 caractères.
export interface Message {
    title: string;
    body: string;
}

export interface ChatMessage {
    author: string;
    message: string;
    timeStamp: string;
}

export enum SystemMessages {
    AUTHOR = 'Système',
    ROOM_LOCKED = 'La salle est maintenant verrouillée',
    ROOM_UNLOCKED = 'La salle est maintenant déverrouillée',
    PLAYER_JOINED = 'a rejoint la partie',
    PLAYER_LEFT = 'a quitté la partie',
    GAME_STARTED = 'Le jeu commence',
    GAME_ENDED = 'Le jeu se termine',
}

export let ROOM_LOCKED_MESSAGE: ChatMessage = { // let instead of const so the timestamp can be updated
    author: SystemMessages.AUTHOR,
    message: SystemMessages.ROOM_LOCKED,
    timeStamp: new Date().toLocaleTimeString(),
};

export let ROOM_UNLOCKED_MESSAGE: ChatMessage = {
    author: SystemMessages.AUTHOR,
    message: SystemMessages.ROOM_UNLOCKED,
    timeStamp: new Date().toLocaleTimeString(),
};

export let GAME_STARTED_MESSAGE: ChatMessage = {
    author: SystemMessages.AUTHOR,
    message: SystemMessages.GAME_STARTED,
    timeStamp: new Date().toLocaleTimeString(),
};

export const GAME_ENDED_MESSAGE: ChatMessage = {
    author: SystemMessages.AUTHOR,
    message: SystemMessages.GAME_ENDED,
    timeStamp: new Date().toLocaleTimeString(),
};
