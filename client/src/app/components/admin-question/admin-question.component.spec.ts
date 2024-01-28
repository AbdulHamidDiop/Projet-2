import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminQuestionComponent } from './admin-question.component';

describe('AdminQuestionComponent', () => {
    let component: AdminQuestionComponent;
    let fixture: ComponentFixture<AdminQuestionComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AdminQuestionComponent],
        });
        fixture = TestBed.createComponent(AdminQuestionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
