import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SocketRoomService } from '@app/services/socket-room.service';
import { Player } from '@common/game';
import { of } from 'rxjs';
import { GamePageComponent } from './game-page.component';
import SpyObj = jasmine.SpyObj;

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let socketMock: SpyObj<SocketRoomService>;

    beforeEach(async () => {
        socketMock = jasmine.createSpyObj('SocketRoomService', ['getProfile']);
        socketMock.getProfile.and.returnValue(of({} as Player));
        await TestBed.configureTestingModule({
            imports: [MatSnackBarModule],
            declarations: [GamePageComponent],
            providers: [
                {
                    provide: SocketRoomService,
                    useValue: socketMock,
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize messages array during component creation', () => {
        expect(component.messages).toEqual([]);
    });

    it('should reinitialize messages array on ngOnInit', () => {
        component.messages = ['existing message'];
        component.ngOnInit();
        expect(component.messages).toEqual([]);
    });
});
