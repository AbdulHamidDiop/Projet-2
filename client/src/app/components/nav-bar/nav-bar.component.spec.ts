import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SocketRoomService as SocketService } from '@app/services/socket-room.service';
import { NavBarComponent } from './nav-bar.component';

describe('NavBarComponent', () => {
    let component: NavBarComponent;
    let router: Router;
    let socketService: SocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                NavBarComponent,
                { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
                { provide: SocketService, useValue: { endGame: jasmine.createSpy('endGame') } },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        component = TestBed.inject(NavBarComponent);
        router = TestBed.inject(Router);
        socketService = TestBed.inject(SocketService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to /createGame and end game when createGame is called', () => {
        component.createGame();

        expect(router.navigate).toHaveBeenCalledWith(['/createGame']);
        expect(socketService.endGame).toHaveBeenCalled();
    });

    it('should navigate to / and end game when home is called', () => {
        component.home();

        expect(router.navigate).toHaveBeenCalledWith(['/']);
        expect(socketService.endGame).toHaveBeenCalled();
    });
});
