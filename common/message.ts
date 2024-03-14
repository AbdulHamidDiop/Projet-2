export interface Message {
    title: string;
    body: string;
}

export interface ChatMessage {
    author: string;
    message: string;
    timeStamp: string;
}

export const MAX_MESSAGE_LENGTH = 200; // 200 caractères.
