import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketRoomService } from '@app/services/socket-room.service';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent],
            providers: [SocketRoomService],
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
