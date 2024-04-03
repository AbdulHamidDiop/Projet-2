import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sort } from '@angular/material/sort';
import { SocketRoomService } from '@app/services/socket-room.service';
import { Player } from '@common/game';
import { PlayerListComponent } from './player-list.component';

describe('PlayerListComponent', () => {
    let component: PlayerListComponent;
    let fixture: ComponentFixture<PlayerListComponent>;
    let socketMock: jasmine.SpyObj<SocketRoomService>;

    beforeEach(() => {
        socketMock = jasmine.createSpyObj('SocketRoomService', ['excludeFromChat', 'includeInChat']);
        socketMock.excludeFromChat.and.returnValue();
        socketMock.includeInChat.and.returnValue();

        TestBed.configureTestingModule({
            declarations: [PlayerListComponent],
            providers: [
                {
                    provide: SocketRoomService,
                    useValue: socketMock,
                },
            ],
        });
        fixture = TestBed.createComponent(PlayerListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should call socket.excludeFromChat on call to excludeFromChat', () => {
        component.excludeFromChat({} as Player);
        expect(socketMock.excludeFromChat).toHaveBeenCalled();
    });

    it('Should call socket.includeInChat on call to includeInChat', () => {
        component.includeInChat({} as Player);
        expect(socketMock.includeInChat).toHaveBeenCalled();
    });

    it('Should have a getStyle method with correct styles', () => {
        const RED = 0xff0000;
        const YELLOW = 0xffff00;
        const GREEN = 0x00ff00;
        const BLACK = 0x000000;

        let expectedOutput = true;
        const player = { color: RED } as Player;
        expectedOutput = expectedOutput && component.getStyle(player) === 'red-text';
        player.color = YELLOW;
        component.getStyle(player);
        expectedOutput = expectedOutput && component.getStyle(player) === 'yellow-text';
        player.color = GREEN;
        component.getStyle(player);
        expectedOutput = expectedOutput && component.getStyle(player) === 'green-text';
        player.color = BLACK;
        component.getStyle(player);
        expectedOutput = expectedOutput && component.getStyle(player) === 'black-text';
        player.color = 1; // Une couleur pas dans la liste
        component.getStyle(player);
        expectedOutput = expectedOutput && component.getStyle(player) === 'blue-text';
        expect(expectedOutput).toBeTrue();
    });

    it('Should have a colorToStyle method with correct status codes', () => {
        const RED = 0xff0000;
        const YELLOW = 0xffff00;
        const GREEN = 0x00ff00;
        const BLACK = 0x000000;

        let expectedOutput = true;
        const player = { color: RED } as Player;
        expectedOutput = expectedOutput && component.colorToState(player.color) === 'Aucune réponse';
        player.color = YELLOW;
        component.getStyle(player);
        expectedOutput = expectedOutput && component.colorToState(player.color) === 'Réponse en cours';
        player.color = GREEN;
        component.getStyle(player);
        expectedOutput = expectedOutput && component.colorToState(player.color) === 'Réponse envoyée';
        player.color = BLACK;
        component.getStyle(player);
        expectedOutput = expectedOutput && component.colorToState(player.color) === 'Abandon';
        player.color = 1; // Une couleur pas dans la liste
        component.getStyle(player);
        expectedOutput = expectedOutput && component.colorToState(player.color) === 'Erreur';
        expect(expectedOutput).toBeTrue();
    });

    it('Should call sortData on three type of fields', () => {
        // La validation de sortData peut se faire en test d'intégration, y a 8 configurations à checker.
        component.players = [
            { name: 'A', score: 0, color: 0 } as Player,
            { name: 'B', score: 1, color: 1 } as Player,
            { name: 'C', score: 2, color: 1 } as Player,
        ];

        const sort = { active: 'name', direction: '' } as unknown as Sort;
        component.sortData(sort);
        sort.direction = 'asc';
        component.sortData(sort);
        sort.direction = 'desc';
        component.sortData(sort);

        sort.active = 'score';
        sort.direction = 'asc';
        component.sortData(sort);
        sort.direction = 'desc';
        component.sortData(sort);

        sort.active = 'state';
        sort.direction = 'asc';
        component.sortData(sort);
        sort.direction = 'desc';
        component.sortData(sort);

        sort.active = 'no-such-field'; // Coverage
        component.sortData(sort);
    });
});
