import { TestBed, discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';
import { TimeService } from './time.service';

const INVALID_TIME = -1;
describe('TimeService', () => {
    let service: TimeService;
    const TIMEOUT = 5;
    const MS_SECOND = 1000;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TimeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should start with a defined start value', fakeAsync(() => {
        service.startTimer(TIMEOUT);
        expect(service.time).toEqual(TIMEOUT);
        discardPeriodicTasks();
    }));

    it('should decrement time by 1 every second', fakeAsync(() => {
        service.startTimer(TIMEOUT);
        tick(MS_SECOND);
        expect(service.time).toEqual(TIMEOUT - 1);
        tick(MS_SECOND);
        expect(service.time).toEqual(TIMEOUT - 2);
        discardPeriodicTasks();
    }));
    it('should stop at 0 and not go negative after the timeout period', fakeAsync(() => {
        service.startTimer(TIMEOUT);
        tick(TIMEOUT * MS_SECOND);
        expect(service.time).toEqual(0);

        tick(2 * MS_SECOND);
        expect(service.time).toEqual(0);
        discardPeriodicTasks();
    }));

    it('interval should stop after TIMEOUT seconds ', fakeAsync(() => {
        service.startTimer(TIMEOUT);
        tick((TIMEOUT + 2) * MS_SECOND);
        expect(service.time).toEqual(0);
    }));

    it('startTimer should call stopTimer at the end of timer', fakeAsync(() => {
        const spy = spyOn(service, 'stopTimer').and.callThrough();
        service.startTimer(TIMEOUT);
        tick((TIMEOUT + 1) * MS_SECOND);
        expect(spy).toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    it('startTimer should start an interval', fakeAsync(() => {
        service.startTimer(TIMEOUT);
        const interval = service['interval'];
        expect(interval).toBeTruthy();
        expect(service.time).toEqual(TIMEOUT);
        discardPeriodicTasks();
    }));

    it('startTimer should call setInterval', fakeAsync(() => {
        const spy = spyOn(window, 'setInterval');
        service.startTimer(TIMEOUT);
        expect(spy).toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    it('startTimer should not start a new interval if one exists', fakeAsync(() => {
        service.startTimer(TIMEOUT);
        const spy = spyOn(window, 'setInterval');
        service.startTimer(TIMEOUT);
        expect(spy).not.toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    it('stopTimer should call clearInterval and setInterval to undefined', fakeAsync(() => {
        const spy = spyOn(window, 'clearInterval');
        service.stopTimer();
        expect(spy).toHaveBeenCalled();
        expect(service['interval']).toBeFalsy();
        discardPeriodicTasks();
    }));

    it('should not start the timer with non-positive values', fakeAsync(() => {
        service.startTimer(0);
        expect(service.time).toEqual(0);
        service.startTimer(INVALID_TIME);
        expect(service.time).toEqual(0);
        discardPeriodicTasks();
    }));

    it('should handle multiple stopTimer calls gracefully', fakeAsync(() => {
        service.startTimer(TIMEOUT);
        tick(TIMEOUT * MS_SECOND);
        service.stopTimer();
        const timeAfterFirstStop = service.time;
        service.stopTimer();
        expect(service.time).toEqual(timeAfterFirstStop);
    }));

    it('stopTimer should stop the countdown', fakeAsync(() => {
        service.startTimer(TIMEOUT);
        tick(MS_SECOND * 2);
        service.stopTimer();
        const timeAfterStop = service.time;
        tick(MS_SECOND * 3);
        expect(service.time).toEqual(timeAfterStop);
    }));

    afterEach(fakeAsync(() => {
        service.stopTimer();
        flush();
    }));

    it('pauseTimer should pause and resume the timer', fakeAsync(() => {
        service.startTimer(TIMEOUT);
        tick(MS_SECOND * 2);
        service.pauseTimer();
        const timeAfterPause = service.time;
        tick(MS_SECOND * 3);
        expect(service.time).toEqual(timeAfterPause);
        service.pauseTimer();
        tick(MS_SECOND * 2);
        expect(service.time).toEqual(timeAfterPause);
        discardPeriodicTasks();
    }));

    it('pauseTimer should resume the timer if it was paused', fakeAsync(() => {
        service.startTimer(TIMEOUT);
        tick(MS_SECOND * 2);
        service.pauseTimer();
        const timeAfterPause = service.time;
        service['pauseFlag'] = true;
        service.pauseTimer();
        tick(MS_SECOND * 2);
        expect(service.time).toEqual(timeAfterPause - 2);
        discardPeriodicTasks();
    }));
});
