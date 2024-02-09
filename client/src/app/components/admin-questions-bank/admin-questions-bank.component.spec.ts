import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Question } from '@app/interfaces/game-elements';
import { AppMaterialModule } from '@app/modules/material.module';
import { QuestionsBankService } from '@app/services/questions-bank.service';
import { Type } from '@common/game';
import { Observable } from 'rxjs';
import { AdminQuestionsBankComponent } from './admin-questions-bank.component';

describe('AdminQuestionsBankComponent', () => {
    let component: AdminQuestionsBankComponent;
    let fixture: ComponentFixture<AdminQuestionsBankComponent>;
    const validQuestion: Question = {
        id: '2',
        type: Type.QCM,
        text: 'Question valide',
        points: 10,
        choices: [
            {
                text: 'Choix valide #1',
                isCorrect: true,
            },
            {
                text: 'Choix valide #2',
                isCorrect: false,
            },
        ],
        answer: 'Choix #1',
    };
    const observableQuestion: Observable<Question[]> = new Observable((subscriber) => {
        subscriber.next([validQuestion]);
    });
    beforeEach(() => {
        //        const questionsBankServiceSpy = new QuestionsBankService();

        TestBed.configureTestingModule({
            imports: [AppMaterialModule, BrowserAnimationsModule],
            declarations: [AdminQuestionsBankComponent],
            providers: [
                {
                    provide: QuestionsBankService,
                    useValue: {
                        getQuestions: jasmine.createSpy('getQuestions').and.returnValue(observableQuestion),
                    },
                },
            ],
        });
        fixture = TestBed.createComponent(AdminQuestionsBankComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
