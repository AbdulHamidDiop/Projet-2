import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { SocketRoomService } from '@app/services/socket-room.service';
import { ChatMessage } from '@common/message';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let socketMock: SpyObj<SocketRoomService>;

    beforeEach(async () => {
        socketMock = jasmine.createSpyObj('SocketRoomService', ['getChatMessages', 'sendChatMessage']);
        socketMock.getChatMessages.and.returnValue(of({} as ChatMessage));
        await TestBed.configureTestingModule({
            declarations: [SidebarComponent],
            providers: [{ provide: SocketRoomService, useValue: socketMock }],
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
            expect(component.messages.length).toEqual(1);
        });
    });

    it('should have initial display message as empty string', () => {
        expect(component.currentMessage.message).toBe('');
    });

    it('Should call socket.sendChatMessage on call to keyboard event Enter, only if the message is below the maximum length', () => {
        component.handleKeyboardPress({ key: 'Enter' } as KeyboardEvent, { value: 'Message' } as HTMLInputElement);
        expect(socketMock.sendChatMessage).toHaveBeenCalled();
        component.handleKeyboardPress(
            { key: 'Enter' } as KeyboardEvent,
            {
                // eslint-disable-next-line max-len
                value: '12345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912345678912',
            } as HTMLInputElement,
        );
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
});
