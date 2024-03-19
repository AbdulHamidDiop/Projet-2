/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketRoomService } from '@app/services/socket-room.service';
import { SelectUsernameComponent } from './select-username.component';
import SpyObj = jasmine.SpyObj;

describe('SelectUsernameComponent', () => {
    let component: SelectUsernameComponent;
    let fixture: ComponentFixture<SelectUsernameComponent>;

    let socketMock: SpyObj<SocketRoomService>;
    let snackBarMock: SpyObj<MatSnackBar>;

    beforeEach(async () => {
        socketMock = jasmine.createSpyObj('SocketRoomService', ['sendPlayerName']);
        snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
        snackBarMock.open.and.returnValue({} as any);
        await TestBed.configureTestingModule({
            declarations: [SelectUsernameComponent],
            providers: [
                { provide: SocketRoomService, useValue: socketMock },
                { provide: MatSnackBar, useValue: snackBarMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectUsernameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Should call socket.sendPlayerName on call to sendUsername, only if name is valid.', () => {
        component.sendUsername({ value: 'NomDutilisateur' } as HTMLInputElement);
        expect(socketMock.sendPlayerName).toHaveBeenCalled();
        component.sendUsername({ value: '1' } as HTMLInputElement);
        expect(snackBarMock.open).toHaveBeenCalled();
    });
});
