/* eslint-disable max-lines */
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BarChartComponent } from '@app/components/bar-chart/bar-chart.component';
import { GameManagerService } from '@app/services/game-manager.service';
import { GameSessionService } from '@app/services/game-session.service';
import { PlayerService } from '@app/services/player.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { TimeService } from '@app/services/time.service';
import { Feedback } from '@common/feedback';
import { Game, Player, Question, Type } from '@common/game';
import { BarChartChoiceStats, QCMStats, QRLAnswer, QRLStats } from '@common/game-stats';
import { Events, Namespaces } from '@common/sockets';
import { of } from 'rxjs';
import { HostGameViewComponent } from './host-game-view.component';
import SpyObj = jasmine.SpyObj;

const SHOW_FEEDBACK_DELAY = 3000;
const START_TIMER_DELAY = 500;
describe('HostGameViewComponent', () => {
    let component: HostGameViewComponent;
    let fixture: ComponentFixture<HostGameViewComponent>;
    let gameManagerServiceSpy: SpyObj<GameManagerService>;
    let socketServiceSpy: SpyObj<SocketRoomService>;
    let timeServiceSpy: SpyObj<TimeService>;
    let gameSessionServiceSpy: SpyObj<GameSessionService>;
    let playerServiceSpy: SpyObj<PlayerService>;
    let routerSpy: SpyObj<Router>;
    let mockQuestion: Question;
    let mockPlayers: Player[];
    let mockStat: QCMStats;
    let mockFeedback: Feedback[];

    const appBarChartMock = {
        updateData: () => {
            return;
        },
        datasets: [],
        labels: [],
    } as unknown as BarChartComponent;

    beforeEach(async () => {
        gameManagerServiceSpy = jasmine.createSpyObj('GameManagerService', [
            'initialize',
            'firstQuestion',
            'goNextQuestion',
            'getFeedBack',
            'endGame',
            'reset',
            'onLastQuestion',
        ]);
        gameManagerServiceSpy.game = { id: 'test-game-id', questions: [], duration: 10 } as unknown as Game;
        gameManagerServiceSpy.onLastQuestion.and.returnValue(true);
        socketServiceSpy = jasmine.createSpyObj('SocketRoomService', ['getPlayers', 'listenForMessages', 'sendMessage']);
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer', 'timerEnded']);
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['findBestScore', 'addGamePlayers', 'nActivePlayers'], { playersInGame: [] });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        socketServiceSpy = jasmine.createSpyObj('SocketRoomService', ['getPlayers', 'listenForMessages', 'sendMessage', 'endGame']);
        socketServiceSpy.getPlayers.and.returnValue(of([]));
        socketServiceSpy.listenForMessages.and.returnValue(of({}));
        socketServiceSpy.endGame.and.returnValue();
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer', 'activatePanicMode', 'deactivatePanicMode'], {
            timerEnded: new EventEmitter<void>(),
        });

        mockQuestion = {
            id: 'test-question-id',
            type: Type.QCM,
            lastModification: new Date(),
            text: 'Test Question',
            points: 10,
            choices: [
                { text: 'Choice 1', isCorrect: true, index: 0 },
                { text: 'Choice 2', isCorrect: false, index: 1 },
            ],
        };
        mockPlayers = [
            { name: 'Player1', isHost: false, id: '1', score: 10, bonusCount: 0 },
            { name: 'Player2', isHost: true, id: '2', score: 20, bonusCount: 1 },
        ] as Player[];
        mockStat = {
            questionId: 'test-question-id',
            choiceIndex: 0,
            selected: true,
            choiceAmount: 2,
            correctIndex: 0,
        };
        mockFeedback = [
            { choice: 'Option 1', status: 'correct' },
            { choice: 'Option 2', status: 'incorrect' },
        ];
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, MatSnackBarModule, NoopAnimationsModule],
            declarations: [HostGameViewComponent],
            providers: [
                { provide: GameManagerService, useValue: gameManagerServiceSpy },
                { provide: SocketRoomService, useValue: socketServiceSpy },
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: GameSessionService, useValue: gameSessionServiceSpy },
                { provide: PlayerService, useValue: playerServiceSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: {
                                get: () => 'test-game-id',
                            },
                        },
                    },
                },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HostGameViewComponent);
        component = fixture.componentInstance;
        component.logic.unitTesting = true;
        component.logic.currentQuestion = mockQuestion;
        component.appBarChart = appBarChartMock;
        gameManagerServiceSpy.firstQuestion.and.returnValue(mockQuestion);
        socketServiceSpy.getPlayers.and.returnValue(of(mockPlayers));
        socketServiceSpy.listenForMessages.and.returnValue(of({}));
        fixture.detectChanges();
        jasmine.getEnv().allowRespy(true);
        component.appBarChart = appBarChartMock;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should handle END_GAME event from SocketRoomService', fakeAsync(() => {
        const openResultsPageSpy = spyOn(component, 'openResultsPage');
        socketServiceSpy.listenForMessages.and.callFake((namespace, event) => {
            if (namespace === Namespaces.GAME && event === Events.END_GAME) {
                return of({});
            }
            return of({});
        });
        component.appBarChart = {
            updateData: () => {
                return;
            },
            datasets: [],
            labels: [],
        } as unknown as BarChartComponent;
        fixture.detectChanges();
        component.ngOnInit();
        tick(SHOW_FEEDBACK_DELAY + START_TIMER_DELAY); // couvrir le max de delay
        flush();
        expect(openResultsPageSpy).toHaveBeenCalled();
    }));

    it('should handle UPDATE_PLAYER event from SocketRoomService', fakeAsync(() => {
        component.appBarChart = appBarChartMock;
        const mockPlayerWithRoom = { name: 'Player1', isHost: false, id: '1', score: 10, bonusCount: 0, room: 'test-room' };
        socketServiceSpy.listenForMessages.and.callFake((namespace, event) => {
            if (namespace === Namespaces.GAME_STATS && event === Events.UPDATE_PLAYER) {
                return of(mockPlayerWithRoom);
            }
            return of({});
        });
        component.ngOnInit();
        tick(SHOW_FEEDBACK_DELAY + START_TIMER_DELAY);
        flush();
    }));

    it('should initialize game and set current question on ngOnInit', fakeAsync(() => {
        component.appBarChart = appBarChartMock;
        component.ngOnInit();
        tick(SHOW_FEEDBACK_DELAY + START_TIMER_DELAY);
        flush();
        expect(gameManagerServiceSpy.initialize).toHaveBeenCalled();
        expect(component.logic.currentQuestion).toEqual(mockQuestion);
    }));

    it('should return the current time from TimeService', () => {
        timeServiceSpy.time = 0;
        expect(component.time).toBe(0);
    });

    it('should update player info on receiving QCM_STATS event', () => {
        component.playerService.playersInGame = [{ name: 'A', score: 0 } as Player] as Player[];
        mockStat.player = { name: 'A', score: 2 } as Player;
        component.updatePlayerFromServer(mockStat);
    });

    it('should update bar chart data on receiving QCM_STATS event', fakeAsync(() => {
        gameManagerServiceSpy.getFeedBack.and.returnValue(Promise.resolve(mockFeedback));
        component.appBarChart = appBarChartMock;
        component.logic.currentQuestion = mockQuestion;
        component.updateBarChartData(mockStat);
        tick();
        expect(component.logic.statisticsData.length).toBeGreaterThan(0);
        expect(component.logic.barChartData.length).toBeGreaterThan(0);
    }));

    it('should decrement bar chart data when stat.selected is false and data value is greater than 0', fakeAsync(() => {
        const initialStat: QCMStats = {
            questionId: 'test-question-id',
            choiceIndex: 0,
            selected: true,
            choiceAmount: 2,
            correctIndex: 0,
        };
        const decrementStat: QCMStats = {
            ...initialStat,
            selected: false,
        };
        component.appBarChart = appBarChartMock;
        component.logic.statisticsData = [
            {
                questionID: 'test-question-id',
                data: [
                    {
                        data: [1],
                        label: 'Choice 1',
                        backgroundColor: '#4CAF50',
                    },
                    {
                        data: [0],
                        label: 'Choice 2',
                        backgroundColor: '#FF4C4C',
                    },
                ],
            },
        ];
        component.updateBarChartData(initialStat);
        tick();
        expect(component.logic.statisticsData[0].data[0].data[0]).toBe(2);
        component.updateBarChartData(decrementStat);
        tick();
        expect(component.logic.statisticsData[0].data[0].data[0]).toBe(1);
        expect(component.logic.barChartData).toEqual(component.logic.statisticsData[0].data);
    }));

    it('should navigate to results page on receiving END_GAME event', fakeAsync(() => {
        component.openResultsPage();
        const PLAYER_COMPONENT_INIT_DELAY = 3500;
        tick(PLAYER_COMPONENT_INIT_DELAY);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/game', 'test-game-id', 'results']);
        tick(SHOW_FEEDBACK_DELAY + START_TIMER_DELAY);
    }));

    it('should update currentQuestion on NEXT_QUESTION event', fakeAsync(() => {
        gameManagerServiceSpy.goNextQuestion.and.returnValue(mockQuestion);
        component.choseNextQuestion();
        tick();
        flush();
        expect(component.logic.currentQuestion).toEqual(mockQuestion);
    }));

    it('should handle NEXT_QUESTION event correctly', fakeAsync(() => {
        const nextQuestionSpy = spyOn(component.gameManagerService, 'goNextQuestion');
        socketServiceSpy.listenForMessages.and.callFake((namespace, event) => {
            if (namespace === Namespaces.GAME && event === Events.NEXT_QUESTION) {
                return of({});
            }
            return of({});
        });
        tick(2 * SHOW_FEEDBACK_DELAY + START_TIMER_DELAY);
        flush();
        expect(nextQuestionSpy).not.toHaveBeenCalled();
    }));

    it('should call showResults and send SHOW_RESULTS and STOP_TIMER messages', () => {
        component.showResults();
        expect(socketServiceSpy.sendMessage).toHaveBeenCalledWith(Events.SHOW_RESULTS, Namespaces.GAME);
        expect(socketServiceSpy.sendMessage).toHaveBeenCalledWith(Events.STOP_TIMER, Namespaces.GAME);
    });

    it('should set showCountDown to true when openCountDownModal is called', () => {
        component.openCountDownModal();
        expect(component.logic.showCountDown).toBeTrue();
    });

    it('should set showCountDown to false when onCountDownModalClosed is called', () => {
        component.onCountDownModalClosed();
        expect(component.logic.showCountDown).toBeFalse();
    });

    it('should call showResults and sendMessage with END_GAME event after a delay', fakeAsync(() => {
        spyOn(component, 'showResults');
        component.notifyEndGame();
        tick(SHOW_FEEDBACK_DELAY);
        expect(component.showResults).toHaveBeenCalled();
        expect(socketServiceSpy.sendMessage).toHaveBeenCalledWith(Events.END_GAME, Namespaces.GAME);
    }));

    it('should show results when endGame is true', () => {
        spyOn(component, 'showResults');
        component.gameManagerService.endGame = true;
        component.choseNextQuestion();
        component.notifyEndGame();
        expect(component.showResults).toHaveBeenCalled();
    });

    it('should update QRL grade data', () => {
        component.logic.questionIndex = 0;
        component.logic.statisticsData[component.logic.questionIndex] = {
            questionID: '1',
            data: [
                { data: [0], label: 'label1', backgroundColor: '#FF4C4C' },
                { data: [0], label: 'label2', backgroundColor: '#FFCE56' },
                { data: [0], label: 'label3', backgroundColor: '#4CAF50' },
            ],
        };

        component.updateQRLGradeData(0);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        component.updateQRLGradeData(0.5);
        component.updateQRLGradeData(1);
        component.updateQRLGradeData(2);
        expect(component.logic.statisticsData[component.logic.questionIndex].data[0].data[0]).toEqual(1);
    });

    it('should grade answers', fakeAsync(() => {
        spyOn(socketServiceSpy, 'sendMessage');
        spyOn(timeServiceSpy, 'stopTimer');

        component.gradeAnswers();
        const RECEIVE_ANSWERS_DELAY = 2500;
        tick(RECEIVE_ANSWERS_DELAY);
        expect(socketServiceSpy.sendMessage).toHaveBeenCalled();
        expect(timeServiceSpy.stopTimer).toHaveBeenCalled();
    }));

    it('should send QRL grade', () => {
        component.logic.statisticsData[component.logic.questionIndex] = {
            questionID: '1',
            data: [
                { data: [0], label: 'label1', backgroundColor: '#FF4C4C' },
                { data: [0], label: 'label2', backgroundColor: '#FFCE56' },
                { data: [0], label: 'label3', backgroundColor: '#4CAF50' },
            ],
        };
        component.logic.currentQRLAnswer = { author: 'author1' } as QRLAnswer;
        spyOn(socketServiceSpy, 'sendMessage');
        spyOn(gameManagerServiceSpy, 'onLastQuestion').and.returnValue(false);

        component.logic.qRLAnswers = [{ author: 'author1' }, { author: 'author2' }] as QRLAnswer[];
        component.logic.currentQuestion = { id: '1', points: 10 } as Question;

        component.sendQRLGrade(1);

        expect(socketServiceSpy.sendMessage).toHaveBeenCalled();
        expect(component.logic.qRLAnswers.length).toEqual(1);

        component.sendQRLGrade(1);
        expect(component.logic.qRLAnswers.length).toEqual(0);

        spyOn(gameManagerServiceSpy, 'onLastQuestion').and.returnValue(true);
        component.logic.currentQRLAnswer = { author: 'author1' } as QRLAnswer;
        component.sendQRLGrade(1);
        expect(component.logic.qRLAnswers.length).toEqual(0);
    });

    it('should notify next question when statisticsData for current questionIndex does not exist', () => {
        spyOn(socketServiceSpy, 'sendMessage');
        component.logic.questionIndex = 0;
        component.logic.currentQuestion = { id: '1' } as Question;
        component.logic.statisticsData = [];
        component.notifyNextQuestion();

        expect(component.logic.statisticsData[component.logic.questionIndex]).toEqual({
            questionID: component.logic.currentQuestion.id,
            data: [],
        });
        expect(component.logic.disableControls).toBeTrue();
        expect(component.logic.questionLoaded).toBeFalse();
        expect(socketServiceSpy.sendMessage).toHaveBeenCalledWith(Events.STOP_TIMER, Namespaces.GAME);
    });

    it('should notify next question when statisticsData for current questionIndex exists', () => {
        spyOn(socketServiceSpy, 'sendMessage');
        component.logic.questionIndex = 0;
        component.logic.currentQuestion = { id: '1' } as Question;
        component.logic.statisticsData[component.logic.questionIndex] = {
            questionID: '2',
            data: [],
        };

        component.notifyNextQuestion();

        expect(component.logic.statisticsData[component.logic.questionIndex]).toEqual({
            questionID: '2',
            data: [],
        });
        expect(component.logic.disableControls).toBeTrue();
        expect(component.logic.questionLoaded).toBeFalse();
        expect(socketServiceSpy.sendMessage).toHaveBeenCalledWith(Events.STOP_TIMER, Namespaces.GAME);
    });

    it('should increment data when stat is edited', async () => {
        const stat: QRLStats = { questionId: '1', edited: true };
        component.logic.statisticsData = [{ questionID: '1', data: [{ data: [0] }, { data: [0] }] as BarChartChoiceStats[] }];
        component.appBarChart = appBarChartMock;
        await component.updateQRLBarChartData(stat);

        expect(component.logic.statisticsData[0].data[0].data[0]).toEqual(1);
    });

    it('should decrement data when stat is not edited and data is greater than 0', async () => {
        const stat: QRLStats = { questionId: '1', edited: false };
        component.logic.statisticsData = [{ questionID: '1', data: [{ data: [1] }, { data: [0] }] as BarChartChoiceStats[] }];
        component.appBarChart = appBarChartMock;
        await component.updateQRLBarChartData(stat);

        expect(component.logic.statisticsData[0].data[0].data[0]).toEqual(0);
    });

    it('should not change data when stat is not edited and data is 0', async () => {
        const stat: QRLStats = { questionId: '1', edited: false } as QRLStats;
        component.logic.statisticsData = [{ questionID: '1', data: [{ data: [0] }, { data: [0] }] as BarChartChoiceStats[] }];
        component.appBarChart = appBarChartMock;
        await component.updateQRLBarChartData(stat);

        expect(component.logic.statisticsData[0].data[0].data[0]).toEqual(0);
    });

    it('should decrement the first data point of the first data set', () => {
        const stat: QRLStats = {
            questionId: '1',
            edited: false,
        };

        component.updateQRLBarChartData(stat);

        expect(component.logic.statisticsData[0].data[0].data[0]).toEqual(0);
    });

    it('should send SHOW_RESULTS message', () => {
        spyOn(socketServiceSpy, 'sendMessage');
        component.showResults();

        expect(socketServiceSpy.sendMessage).toHaveBeenCalledWith(Events.SHOW_RESULTS, Namespaces.GAME);
    });

    it('should send PAUSE_TIMER message', () => {
        spyOn(socketServiceSpy, 'sendMessage');
        component.sendTimerControlMessage();

        expect(socketServiceSpy.sendMessage).toHaveBeenCalledWith(Events.PAUSE_TIMER, Namespaces.GAME);
    });

    it('should activate panic mode and send PANIC_MODE message', () => {
        spyOn(socketServiceSpy, 'sendMessage');
        component.logic.currentQuestion = { type: Type.QCM } as Question;

        component.activatePanicMode();

        expect(component.logic.inPanicMode).toBeTrue();
        expect(socketServiceSpy.sendMessage).toHaveBeenCalledWith(Events.PANIC_MODE, Namespaces.GAME, { type: Type.QCM });
    });

    it('should call notifyNextQuestion for QCM type', () => {
        spyOn(component, 'notifyNextQuestion');
        spyOn(component, 'gradeAnswers');
        component.logic.currentQuestion = { type: Type.QCM } as Question;

        component.handleTimerEnd();

        expect(component.notifyNextQuestion).toHaveBeenCalled();
        expect(component.gradeAnswers).not.toHaveBeenCalled();
    });

    it('should call gradeAnswers for non-QCM type', () => {
        spyOn(component, 'gradeAnswers');
        spyOn(component, 'notifyNextQuestion');
        component.logic.currentQuestion = { type: Type.QRL } as Question;

        component.handleTimerEnd();

        expect(component.notifyNextQuestion).not.toHaveBeenCalled();
        expect(component.gradeAnswers).toHaveBeenCalled();
    });

    it('should unsubscribe after ngOnDestroy', () => {
        spyOn(component.gameManagerService, 'reset');
        component.ngOnDestroy();
        expect(component.gameManagerService.reset).toHaveBeenCalled();
    });

    it('should correctly handle nextQuestion event', () => {
        spyOn(component.gameManagerService, 'goNextQuestion').and.returnValue(mockQuestion);
        component.onNextQuestionReceived();
        expect(component.gameManagerService.goNextQuestion).toHaveBeenCalled();
        expect(component.logic.disableControls).toBeFalse();
        expect(component.logic.gradingAnswers).toBeFalse();

        spyOn(component.gameManagerService, 'goNextQuestion').and.returnValue({ type: Type.QRL } as Question);
        component.onNextQuestionReceived();

        spyOn(component.gameManagerService, 'onLastQuestion').and.returnValue(true);
        component.onNextQuestionReceived();
        expect(component.logic.onLastQuestion).toBeTrue();
    });

    it('should handle player left event', fakeAsync(() => {
        const playerLeftSpy = spyOn(playerServiceSpy, 'nActivePlayers').and.returnValue(0);
        const endGameSpy = spyOn(socketServiceSpy, 'endGame');

        component.onPlayerLeft({ user: 'test' });
        tick(SHOW_FEEDBACK_DELAY);
        expect(playerLeftSpy).toHaveBeenCalled();
        expect(endGameSpy).toHaveBeenCalled();
    }));

    it('should handle player left event', fakeAsync(() => {
        const playerLeftSpy = spyOn(playerServiceSpy, 'nActivePlayers').and.returnValue(0);
        const endGameSpy = spyOn(socketServiceSpy, 'endGame');

        component.onPlayerLeft({ user: 'test' });
        tick(SHOW_FEEDBACK_DELAY);

        expect(playerLeftSpy).toHaveBeenCalled();
        expect(endGameSpy).toHaveBeenCalled();
    }));

    it('should update QRL bar chart data when question type is QRL', () => {
        const updateQRLBarChartDataSpy = spyOn(component, 'updateQRLBarChartData');
        component.logic.currentQuestion = { type: Type.QRL, id: 'test' } as Question;

        component.onPlayerLeft({ user: 'test' });

        expect(updateQRLBarChartDataSpy).toHaveBeenCalled();
    });
});
