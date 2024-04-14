/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/naming-convention */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BarChartComponent } from '@app/components/bar-chart/bar-chart.component';
import { Game, GameService } from '@app/services/game.service';
import { PlayerService } from '@app/services/player.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { Player, Type } from '@common/game';
import { ChatMessage } from '@common/message';
import { Events, Namespaces } from '@common/sockets';
import { of } from 'rxjs';
import { ResultsPageComponent } from './results-page.component';

const PLAYER_DATA = {
    0: { name: 'Alice', isHost: false, id: '1', score: 10, bonusCount: 0 },
    1: { name: 'Charlie', isHost: false, id: '3', score: 15, bonusCount: 0 },
    2: { name: 'Bob', isHost: false, id: '2', score: 10, bonusCount: 0 },
    3: { name: 'Dave', isHost: false, id: '4', score: 20, bonusCount: 0 },
    room: 5555,
};
const GAME_RESULTS_DATA = {
    0: {
        questionID: '1',
        data: [
            { data: [10], label: 'Choice A', backgroundColor: '#4CAF50' },
            { data: [30], label: 'Choice B', backgroundColor: '#FF4C4C' },
        ],
    },
    1: {
        questionID: '2',
        data: [
            { data: [15], label: 'Choice A', backgroundColor: '#4CAF50' },
            { data: [35], label: 'Choice B', backgroundColor: '#FF4C4C' },
        ],
    },
    room: 5555,
};

const FAKE_GAME: Game = {
    id: '12345',
    title: 'Quiz on Web Development',
    description: 'Test your knowledge on various web development topics',
    duration: 45,
    lastModification: new Date(),
    isHidden: false,
    questions: [
        {
            id: 'test-question-id',
            type: Type.QCM,
            lastModification: new Date(),
            text: 'Test Question',
            points: 10,
            choices: [
                { text: 'Choice 1', isCorrect: true, index: 0 },
                { text: 'Choice 2', isCorrect: false, index: 1 },
            ],
        },
        {
            id: 'test-question-id2',
            type: Type.QCM,
            lastModification: new Date(),
            text: 'Test Question',
            points: 20,
            choices: [
                { text: 'Choice 1', isCorrect: false, index: 0 },
                { text: 'Choice 2', isCorrect: true, index: 1 },
            ],
        },
    ],
};

const PLAYER_LIST: Player[] = [
    { name: 'Alice', isHost: false, id: '1', score: 10, bonusCount: 0 },
    { name: 'Charlie', isHost: false, id: '3', score: 15, bonusCount: 0 },
    { name: 'Bob', isHost: false, id: '2', score: 10, bonusCount: 0 },
    { name: 'Dave', isHost: false, id: '4', score: 20, bonusCount: 0 },
] as Player[];
const CHAT_MESSAGE: ChatMessage = {
    author: 'John Doe',
    message: 'Hello, this is a test message!',
    timeStamp: '2024-03-24T12:34:56.789Z',
};

describe('ResultsPageComponent', () => {
    let component: ResultsPageComponent;
    let fixture: ComponentFixture<ResultsPageComponent>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockSocketRoomService: jasmine.SpyObj<SocketRoomService>;
    let mockPlayerService: jasmine.SpyObj<PlayerService>;
    let mockActivatedRoute: unknown;
    const appBarChartMock = {
        updateData: () => {
            return;
        },
        datasets: [],
        labels: [],
    } as unknown as BarChartComponent;

    beforeEach(async () => {
        mockGameService = jasmine.createSpyObj('GameService', ['getGameByID']);
        mockPlayerService = jasmine.createSpyObj('PlayerService', ['nActivePlayers'], {
            player: PLAYER_LIST[0],
            playersInGame: PLAYER_LIST,
        });

        mockSocketRoomService = jasmine.createSpyObj('SocketRoomService', [
            'listenForMessages',
            'getChatMessages',
            'sendMessage',
            'endGame',
            'sendChatMessage',
            'leaveRoom',
            'resetGameState',
        ]);
        mockActivatedRoute = {
            paramMap: of({
                get: (key: string) => 'test-game-id',
            }),
        };

        await TestBed.configureTestingModule({
            declarations: [ResultsPageComponent],
            imports: [RouterTestingModule],
            providers: [
                { provide: GameService, useValue: mockGameService },
                { provide: SocketRoomService, useValue: mockSocketRoomService },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: PlayerService, useValue: mockPlayerService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        mockSocketRoomService.listenForMessages.and.returnValues(of(PLAYER_DATA), of(GAME_RESULTS_DATA));
        mockSocketRoomService.getChatMessages.and.returnValue(of(CHAT_MESSAGE));
        mockSocketRoomService.sendChatMessage.and.returnValue();

        mockPlayerService.nActivePlayers.and.returnValue(4);

        mockGameService.getGameByID.and.returnValue(FAKE_GAME);
        fixture = TestBed.createComponent(ResultsPageComponent);
        component = fixture.componentInstance;
        component.appBarChart = appBarChartMock;

        fixture.detectChanges();
    });

    afterEach(() => {
        component.ngOnDestroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update chart data when showing next histogram', () => {
        component.appBarChart = appBarChartMock;
        component.showNextHistogram();
        expect(component.currentHistogramIndex).toBe(1);
        expect(component.currentHistogramData).toEqual(GAME_RESULTS_DATA[1].data);
    });

    it('should update chart data when showing previous histogram', () => {
        component.appBarChart = appBarChartMock;
        component.currentHistogramIndex = 1;
        component.showPreviousHistogram();
        expect(component.currentHistogramIndex).toBe(0);
        expect(component.currentHistogramData).toEqual(GAME_RESULTS_DATA[0].data);
    });

    it('should navigate to initial view when returnToInitialView is called', () => {
        const leaveSpy = spyOn(component, 'leaveWithoutKickingPlayers');
        component.returnToInitialView();
        expect(leaveSpy).toHaveBeenCalled();
    });

    it('should sort players by score in descending order and by name in ascending order if scores are equal', () => {
        component.sortPlayers();
        expect(component.players).toEqual([
            { name: 'Dave', isHost: false, id: '4', score: 20, bonusCount: 0 },
            { name: 'Charlie', isHost: false, id: '3', score: 15, bonusCount: 0 },
            { name: 'Alice', isHost: false, id: '1', score: 10, bonusCount: 0 },
            { name: 'Bob', isHost: false, id: '2', score: 10, bonusCount: 0 },
        ] as Player[]);
    });

    it('should leave without kicking players if player is not the host', () => {
        component.leaveWithoutKickingPlayers();
        expect(mockSocketRoomService.endGame).toHaveBeenCalledWith('À la prochaine partie!');

        component.playerService.player.name = 'Organisateur';
        component.leaveWithoutKickingPlayers();
        expect(mockSocketRoomService.sendMessage).toHaveBeenCalledWith(Events.CLEANUP_GAME, Namespaces.GAME);
    });
});
