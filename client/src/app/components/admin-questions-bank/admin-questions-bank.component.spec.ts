import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdkDropList } from '@angular/cdk/drag-drop';
import { AdminQuestionsBankComponent } from './admin-questions-bank.component';

describe('AdminQuestionsBankComponent', () => {
    let component: AdminQuestionsBankComponent;
    let fixture: ComponentFixture<AdminQuestionsBankComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CdkDropList],
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
