import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PlayerService } from '@app/services/player.service';
import { QuestionsService } from '@app/services/questions.service';
import { SocketRoomService } from '@app/services/socket-room.service';
import { Question, Type } from '@common/game';
import { GameRandomComponent } from './game-random.component';

describe('GameRandomComponent', () => {
    let component: GameRandomComponent;
    let fixture: ComponentFixture<GameRandomComponent>;
    let mockQuestionsService: jasmine.SpyObj<QuestionsService>;
    let mockSocketRoomService: jasmine.SpyObj<SocketRoomService>;
    let mockPlayerService: jasmine.SpyObj<PlayerService>;

    beforeEach(async () => {
        // Create spy objects for each service
        mockQuestionsService = jasmine.createSpyObj('QuestionsService', ['getRandomQuestions']);
        mockSocketRoomService = jasmine.createSpyObj('SocketRoomService', ['leaveRoom', 'createRoom']);
        mockPlayerService = jasmine.createSpyObj('PlayerService', ['nActivePlayers'], { player: { isHost: false, name: '' } });
        mockPlayerService.nActivePlayers.and.returnValue(0);

        await TestBed.configureTestingModule({
            declarations: [GameRandomComponent],
            // Provide the mock services
            providers: [
                { provide: QuestionsService, useValue: mockQuestionsService },
                { provide: SocketRoomService, useValue: mockSocketRoomService },
                { provide: PlayerService, useValue: mockPlayerService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        const mockQuestions: Question[] = [
            { id: '1', type: Type.QCM, lastModification: null, text: 'Question 1?', points: 10, choices: [], answer: 'A' } as Question,
            { id: '2', type: Type.QCM, lastModification: null, text: 'Question 2?', points: 10, choices: [], answer: 'B' },
            { id: '3', type: Type.QCM, lastModification: null, text: 'Question 3?', points: 10, choices: [], answer: 'C' },
            { id: '4', type: Type.QCM, lastModification: null, text: 'Question 4?', points: 10, choices: [], answer: 'D' },
            { id: '5', type: Type.QCM, lastModification: null, text: 'Question 5?', points: 10, choices: [], answer: 'E' },
        ] as Question[];
        mockQuestionsService.getRandomQuestions.and.returnValue(Promise.resolve(mockQuestions));
        fixture = TestBed.createComponent(GameRandomComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should set questions and make game visible if sufficient questions are returned', async () => {
        expect(component.questions.length).toBeGreaterThan(0);
        expect(component.show).toBeTrue();
        expect(component.game).toBeDefined();
    });

    it('should configure the player as host, leave the current room, and create a new room with the game', () => {
        component.launchGame();
        expect(mockSocketRoomService.leaveRoom).toHaveBeenCalled();
        expect(mockPlayerService.player.isHost).toBeTrue();
        expect(mockPlayerService.player.name).toEqual('Organisateur');
        expect(component.game.title).toEqual('Mode Aléatoire');
        expect(component.game.id.endsWith('aleatoire')).toBeTrue();
    });
});
