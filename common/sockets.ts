export enum Namespaces {
    CHAT_MESSAGES = 'chatMessages',
    WAITING_ROOM = 'waitingRoom',
    GAME_STATS = 'gameStats',
    GAME = 'game',
    GLOBAL_NAMESPACE = 'global',
}

export enum Events {
    CREATE_ROOM = 'createRoom',
    DELETE_ROOM = 'deleteRoom',
    JOIN_ROOM = 'joinRoom',
    CONNECTION = 'connection',
    CHAT_MESSAGE = 'chatMessage',
    WAITING_ROOM_NOTIFICATION = 'waitingRoomNotification',
    QCM_STATS = 'qcmStats',
    QRL_STATS = 'qrlStats',
    NEXT_QUESTION = 'nextQuestion',
    END_GAME = 'endGame',
}
