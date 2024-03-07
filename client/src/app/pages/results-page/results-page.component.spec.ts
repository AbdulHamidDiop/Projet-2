import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
// import { SocketRoomService } from '@app/services/socket-room.service';
// import { SocketsService } from '@app/services/sockets.service';
// import { of } from 'rxjs';
import { ResultsPageComponent } from './results-page.component';

describe('ResultsPageComponent', () => {
    let component: ResultsPageComponent;
    let fixture: ComponentFixture<ResultsPageComponent>;
    // let socketsServiceSpy: jasmine.SpyObj<SocketsService>;
    // let socketRoomServiceSpy: jasmine.SpyObj<SocketRoomService>;

    beforeEach(async () => {
        // socketsServiceSpy = jasmine.createSpyObj('SocketsService', ['joinRoom', 'listenForMessages']);
        // socketRoomServiceSpy = jasmine.createSpyObj('SocketRoomService', ['getChatMessages']);

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [ResultsPageComponent],
            providers: [
                // { provide: SocketsService, useValue: socketsServiceSpy },
                // { provide: SocketRoomService, useValue: socketRoomServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ResultsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should sort players by score and name', () => {
        component.players = [
            { name: 'Player2', isHost: false, id: '2', score: 10, bonusCount: 0 },
            { name: 'Player1', isHost: false, id: '1', score: 20, bonusCount: 0 },
            { name: 'Player3', isHost: false, id: '3', score: 10, bonusCount: 0 },
        ];
        component.sortPlayers();
        expect(component.players).toEqual([
            { name: 'Player1', isHost: false, id: '1', score: 20, bonusCount: 0 },
            { name: 'Player2', isHost: false, id: '2', score: 10, bonusCount: 0 },
            { name: 'Player3', isHost: false, id: '3', score: 10, bonusCount: 0 },
        ]);
    });

    it('should navigate to home page when returnToInitialView is called', () => {
        const routerSpy = spyOn(component.router, 'navigate');
        component.returnToInitialView();
        expect(routerSpy).toHaveBeenCalledWith(['/home']);
    });

    it('should add chat message when a new message is received', () => {
        const newMessage = 'New message';
        // socketRoomServiceSpy.getChatMessages.and.returnValue(of(newMessage));
        component.ngOnInit();
        expect(component.chatMessages).toContain(newMessage);
    });
});
