import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SocketRoomService } from '@app/services/socket-room.service';
import { QRLStatService } from './qrl-stats.service';

const CHECK_INTERVAL = 5000;

describe('QRLStatsService', () => {
    let service: QRLStatService;
    let socketService: SocketRoomService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatSnackBarModule],

            providers: [QRLStatService, { provide: socketService, useValue: { sendMessage: jasmine.createSpy('sendMessage') } }],
        });

        service = TestBed.inject(QRLStatService);
        socketService = jasmine.createSpyObj('SocketService', ['sendMessage']);
        service = new QRLStatService(socketService);
        socketService = TestBed.inject(SocketRoomService);
    });

    afterEach(() => {
        service.ngOnDestroy();
        service.stopTimer();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should send message and update lastEditedStatusSent if edited recently', () => {
        spyOn(socketService, 'sendMessage').and.callThrough();
        service.lastEditTime = Date.now();
        service.questionId = '1';

        service.handleTap();

        expect(service.lastEditedStatusSent).toEqual(true);
    });

    it('should send message, update lastEditedStatusSent, and reset lastEditTime if not edited recently', () => {
        spyOn(socketService, 'sendMessage').and.callThrough();
        service.lastEditTime = Date.now() - CHECK_INTERVAL - 1;
        service.questionId = '1';

        service.handleTap();
        expect(service.lastEditedStatusSent).toBeNull();
        expect(service.lastEditTime).toBeNull();
    });

    it('should reset properties when stopTimer is called', () => {
        service.stopTimer();

        expect(service.questionId).toBeNull();
        expect(service.lastEditTime).toBeNull();
        expect(service.lastEditedStatusSent).toBeNull();
    });

    it('should update lastEditTime when notifyEdit is called', () => {
        const before = Date.now();
        service.notifyEdit();
        const after = Date.now();

        expect(service.lastEditTime).toBeGreaterThanOrEqual(before);
        expect(service.lastEditTime).toBeLessThanOrEqual(after);
        service.startTimer('1');
    });
});
