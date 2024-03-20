/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/naming-convention */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Game, GameService } from '@app/services/game.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { Type } from '@common/game';
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
            answer: 'Choice 1',
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
            answer: 'Choice 1',
        },
    ],
};

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
    let mockActivatedRoute: unknown;

    beforeEach(async () => {
        mockGameService = jasmine.createSpyObj('GameService', ['getGameByID']);
        mockSocketRoomService = jasmine.createSpyObj('SocketRoomService', ['listenForMessages', 'getChatMessages', 'sendMessage']);
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
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        mockSocketRoomService.listenForMessages.and.returnValues(of(PLAYER_DATA), of(GAME_RESULTS_DATA));

        mockSocketRoomService.getChatMessages.and.returnValue(of(CHAT_MESSAGE));

        mockGameService.getGameByID.and.returnValue(FAKE_GAME);
        fixture = TestBed.createComponent(ResultsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update chart data when showing next histogram', () => {
        component.showNextHistogram();
        expect(component.currentHistogramIndex).toBe(1);
        expect(component.currentHistogramData).toEqual(GAME_RESULTS_DATA[1].data);
        expect(mockSocketRoomService.sendMessage).toHaveBeenCalledWith(Events.UPDATE_CHART, Namespaces.GAME_STATS);
    });

    it('should update chart data when showing previous histogram', () => {
        component.currentHistogramIndex = 1;
        component.showPreviousHistogram();
        expect(component.currentHistogramIndex).toBe(0);
        expect(component.currentHistogramData).toEqual(GAME_RESULTS_DATA[0].data);
        expect(mockSocketRoomService.sendMessage).toHaveBeenCalledWith(Events.UPDATE_CHART, Namespaces.GAME_STATS);
    });

    it('should navigate to initial view when returnToInitialView is called', () => {
        const routerSpy = spyOn(component.router, 'navigate');
        component.returnToInitialView();
        expect(routerSpy).toHaveBeenCalledWith(['/home']);
    });

    it('should sort players by score in descending order and by name in ascending order if scores are equal', () => {
        component.sortPlayers();
        expect(component.players).toEqual([
            { name: 'Dave', isHost: false, id: '4', score: 20, bonusCount: 0 },
            { name: 'Charlie', isHost: false, id: '3', score: 15, bonusCount: 0 },
            { name: 'Alice', isHost: false, id: '1', score: 10, bonusCount: 0 },
            { name: 'Bob', isHost: false, id: '2', score: 10, bonusCount: 0 },
        ]);
    });
});
