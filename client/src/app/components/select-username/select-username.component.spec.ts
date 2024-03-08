import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocketRoomService } from '@app/services/socket-room.service';
import { SelectUsernameComponent } from './select-username.component';
import SpyObj = jasmine.SpyObj;

describe('SelectUsernameComponent', () => {
    let component: SelectUsernameComponent;
    let fixture: ComponentFixture<SelectUsernameComponent>;

    let socketMock: SpyObj<SocketRoomService>;
    beforeEach(async () => {
        socketMock = jasmine.createSpyObj('SocketRoomService', ['sendPlayerName']);
        await TestBed.configureTestingModule({
            declarations: [SelectUsernameComponent],
            providers: [{ provide: SocketRoomService, useValue: socketMock }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectUsernameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Should call socket.sendPlayerName on call to sendUsername, only if name is valid.', () => {
        component.sendUsername({ value: 'Nom' } as HTMLInputElement);
        expect(socketMock.sendPlayerName).toHaveBeenCalled();
        component.sendUsername({ value: 'A321' } as HTMLInputElement);
        expect(socketMock.sendPlayerName).toHaveBeenCalled();
    });
});
