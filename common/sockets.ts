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
    KICK_PLAYER = 'kickPlayer',
    GET_PLAYERS = 'getPlayers',
    LEAVE_ROOM = 'leaveRoom',
    LOCK_ROOM = 'lockRoom',
    UNLOCK_ROOM = 'unlockRoom',
    SET_PLAYER_NAME = 'playerName',
    GET_GAME_ID = 'getGameId',
    GET_PLAYER_PROFILE = 'playerProfile',
    START_GAME = 'startGame',
    NAME_NOT_AVAILABLE = 'nameNotAvailable',
    GAME_RESULTS = 'gameResults',
    CHAT_HISTORY = 'chatHistory',
    START_TIMER = 'startTimer'
}

export const LOBBY = '0';
