import { TestBed } from '@angular/core/testing';

import { IoService } from './ioservice.service';

describe('IoserviceService', () => {
    let service: IoService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(IoService);
    });

    it('Should have an io method', () => {
        service.io('');
        expect(service.io).toBeTruthy();
    });
});
