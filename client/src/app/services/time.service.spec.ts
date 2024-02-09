import { TestBed, discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';

import { TimeService } from './time.service';

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
        flush();
    }));

    it('should decrement time by 1 every second', fakeAsync(() => {
        service.startTimer(TIMEOUT);
        tick(MS_SECOND);
        expect(service.time).toEqual(TIMEOUT - 1);
        flush();
    }));

    it('should stop after reaching 0', fakeAsync(() => {
        service.startTimer(TIMEOUT);
        tick(TIMEOUT * MS_SECOND);
        expect(service.time).toEqual(0);
        flush();
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

    it('interval should reduce time by 1 every second ', fakeAsync(() => {
        service.startTimer(TIMEOUT);
        tick(MS_SECOND);
        expect(service.time).toEqual(TIMEOUT - 1);
        tick(MS_SECOND);
        expect(service.time).toEqual(TIMEOUT - 2);
        discardPeriodicTasks();
    }));

    it('interval should stop after TIMEOUT seconds ', fakeAsync(() => {
        service.startTimer(TIMEOUT);
        tick((TIMEOUT + 2) * MS_SECOND);
        expect(service.time).toEqual(0);
        discardPeriodicTasks();
    }));

    it('startTimer should not start a new interval if one exists', fakeAsync(() => {
        service.startTimer(TIMEOUT);
        const spy = spyOn(window, 'setInterval');
        service.startTimer(TIMEOUT);
        expect(spy).not.toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    it('startTimer should call stopTimer at the end of timer', fakeAsync(() => {
        const spy = spyOn(service, 'stopTimer').and.callThrough();
        service.startTimer(TIMEOUT);
        tick((TIMEOUT + 1) * MS_SECOND);
        expect(spy).toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    it('stopTimer should call clearInterval and setInterval to undefined', fakeAsync(() => {
        const spy = spyOn(window, 'clearInterval');
        service.stopTimer();
        expect(spy).toHaveBeenCalled();
        expect(service['interval']).toBeFalsy();
        discardPeriodicTasks();
    }));
});
