/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { SocketRoomService } from '@app/services/socket-room.service';
import { ChatMessage } from '@common/message';
import { Events, Namespaces } from '@common/sockets';
import { Subject, of } from 'rxjs';

import SpyObj = jasmine.SpyObj;

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let socketMock: SpyObj<SocketRoomService>;
    let snackBarMock: SpyObj<MatSnackBar>;
    beforeEach(async () => {
        socketMock = jasmine.createSpyObj(
            'SocketRoomService',
            ['getChatMessages', 'sendChatMessage', 'listenForMessages', 'sendMessage', 'joinAllNamespaces'],
            ['room'],
        );
        snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

        socketMock.getChatMessages.and.returnValue(of({} as ChatMessage));
        socketMock.listenForMessages.and.returnValue(of({}));
        socketMock.sendMessage.and.returnValue({} as any);

        await TestBed.configureTestingModule({
            declarations: [SidebarComponent],
            providers: [
                { provide: SocketRoomService, useValue: socketMock },
                { provide: MatSnackBar, useValue: snackBarMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('Should call socket.getChatMessages on creation', () => {
        expect(socketMock.getChatMessages).toHaveBeenCalled();
        socketMock.getChatMessages().subscribe(() => {
            expect(component.messages.length).toEqual(3);
        });
    });

    it('should have initial display message as empty string', () => {
        expect(component.currentMessage.message).toBe('');
    });

    it('Should call socket.sendChatMessage on call to keyboard event Enter, only if the message is below the maximum length', () => {
        component.currentMessage = { message: 'Message' } as ChatMessage;
        component.handleKeyboardPress({ key: 'Enter' } as KeyboardEvent, { value: 'Message' } as HTMLInputElement);
        expect(socketMock.sendChatMessage).toHaveBeenCalled();
        component.handleKeyboardPress(
            { key: 'Enter' } as KeyboardEvent,
            {
                // eslint-disable-next-line max-len
                value: '12345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912',
            } as HTMLInputElement,
        );
        component.currentMessage = { message: '' } as ChatMessage;
        component.handleKeyboardPress({ key: 'E' } as KeyboardEvent, { value: 'E' } as HTMLInputElement);
        expect(socketMock.sendChatMessage).toHaveBeenCalledTimes(1);
    });

    describe('handleKeyboardPress', () => {
        it('should add current message to message history on "Enter" key press', () => {
            const input = document.createElement('input');
            const event = new KeyboardEvent('keydown', { key: 'Enter' });

            input.value = 'Test message';
            component.currentMessage = { message: input.value } as ChatMessage;
            component.handleKeyboardPress(event, input);
        });

        it('should update current message on other key press', () => {
            const input = document.createElement('input');
            const event = new KeyboardEvent('keydown', { key: 'a' });

            input.value = 'Test message';
            component.handleKeyboardPress(event, input);

            expect(component.currentMessage).toBeTruthy();
        });
    });

    describe('SideBar with dynamic socket messages', () => {
        const chatMessagesSubject = new Subject<ChatMessage>();
        const chatHistorySubject = new Subject<ChatMessage[]>();
        const globalChatSubject = new Subject<ChatMessage>();
        const testMessage: ChatMessage = { author: 'room', message: 'test', timeStamp: 'test' };

        socketMock = jasmine.createSpyObj('SocketRoomService', ['getChatMessages', 'sendChatMessage', 'listenForMessages', 'joinAllNamespaces']);
        socketMock.getChatMessages.and.returnValue(globalChatSubject.asObservable());
        socketMock.joinAllNamespaces.and.returnValue(Promise.resolve([]));

        beforeEach(async () => {
            socketMock.getChatMessages.and.returnValue(globalChatSubject.asObservable());
            socketMock.sendChatMessage.and.returnValue({} as any);
            socketMock.joinAllNamespaces.and.returnValue(Promise.resolve([]));
            socketMock.listenForMessages.and.callFake((namespace: string, event: string) => {
                if (namespace === Namespaces.CHAT_MESSAGES && event === Events.CHAT_MESSAGE) {
                    return chatMessagesSubject.asObservable();
                } else if (namespace === Namespaces.CHAT_MESSAGES && event === Events.CHAT_HISTORY) {
                    return chatHistorySubject.asObservable();
                }
                return globalChatSubject.asObservable();
            });
        });

        beforeEach(() => {
            fixture = TestBed.createComponent(SidebarComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should update message history on chat message event', () => {
            spyOn(component, 'autoScroll');
            chatMessagesSubject.next(testMessage);
            expect(component.messages).toBeTruthy();
            expect(component.autoScroll).toHaveBeenCalled();
            expect(component.messages.length).toEqual(1);
        });

        it('should update message history on chat history event', () => {
            spyOn(component, 'autoScroll');
            chatHistorySubject.next([testMessage]);
            expect(component.messages).toBeTruthy();
            expect(component.autoScroll).toHaveBeenCalled();
            expect(component.messages.length).toEqual(1);
        });

        it('should handle chat message from "room" and attempt to join all namespaces', fakeAsync(() => {
            globalChatSubject.next(testMessage);
            flush();

            expect(component.socketsService.joinAllNamespaces).toHaveBeenCalledWith(testMessage.message);
            globalChatSubject.next({ author: 'test', message: 'test', timeStamp: 'test' });
            flush();
            expect(component.messages.length).toEqual(1);
        }));
    });
});
