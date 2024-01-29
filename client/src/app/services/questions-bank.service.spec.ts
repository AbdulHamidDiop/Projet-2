import { TestBed } from '@angular/core/testing';

import { QuestionsBankService } from './questions.service';

describe('QuestionsBankService', () => {
    let service: QuestionsBankService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(QuestionsBankService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
