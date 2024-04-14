import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketRoomService } from '@app/services/socket-room.service';
import { of } from 'rxjs';
import { SelectUsernameComponent } from './select-username.component';
import SpyObj = jasmine.SpyObj;
/* eslint-disable @typescript-eslint/no-explicit-any */
// Pour les tests on utilise souvent des any.

describe('SelectUsernameComponent', () => {
    let component: SelectUsernameComponent;
    let fixture: ComponentFixture<SelectUsernameComponent>;

    let socketMock: SpyObj<SocketRoomService>;
    let snackBarMock: SpyObj<MatSnackBar>;

    beforeEach(async () => {
        socketMock = jasmine.createSpyObj('SocketRoomService', ['sendPlayerName', 'onNameNotAvailable', 'onNameBanned']);
        snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
        socketMock.onNameNotAvailable.and.returnValue(of(undefined));
        socketMock.onNameBanned.and.returnValue(of(undefined));

        snackBarMock.open.and.returnValue({} as any);
        await TestBed.configureTestingModule({
            declarations: [SelectUsernameComponent],
            providers: [
                { provide: SocketRoomService, useValue: socketMock },
                { provide: MatSnackBar, useValue: snackBarMock },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectUsernameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should call socket.sendPlayerName if name is valid', () => {
        const validName = 'Validname';
        component.sendUsername({ value: validName } as HTMLInputElement);
        expect(socketMock.sendPlayerName).toHaveBeenCalledWith(validName);
    });

    it('Should not call socket.sendPlayerName and call snackBar.open if name is invalid', () => {
        const invalidName = '1';
        component.sendUsername({ value: invalidName } as HTMLInputElement);
        expect(socketMock.sendPlayerName).not.toHaveBeenCalledWith(invalidName);
        expect(snackBarMock.open).toHaveBeenCalledWith('Le nom entré est invalide', 'fermer', {
            verticalPosition: 'top',
            duration: 5000,
        });
    });

    it('Should call snackBar.open if name is already in use', () => {
        socketMock.onNameNotAvailable.and.returnValue(of(undefined));
        component.sendUsername({ value: 'UsedName' } as HTMLInputElement);
        fixture.detectChanges();
        expect(snackBarMock.open).toHaveBeenCalledWith('Le nom choisi est déjà utilisé', 'Fermer', {
            verticalPosition: 'top',
            duration: 5000,
        });
    });

    it('Should call snackBar.open if name is banned', () => {
        socketMock.onNameBanned.and.returnValue(of(undefined));
        component.sendUsername({ value: 'Organisateur' } as HTMLInputElement);
        fixture.detectChanges();
        expect(snackBarMock.open).toHaveBeenCalledWith('Le nom choisi est banni et ne peut-être utilisé', 'Fermer', {
            verticalPosition: 'top',
            duration: 5000,
        });
    });
});
