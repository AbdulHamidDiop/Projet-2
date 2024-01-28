import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminQuestionsBankComponent } from './admin-questions-bank.component';

describe('AdminQuestionsBankComponent', () => {
    let component: AdminQuestionsBankComponent;
    let fixture: ComponentFixture<AdminQuestionsBankComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AdminQuestionsBankComponent],
        });
        fixture = TestBed.createComponent(AdminQuestionsBankComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
