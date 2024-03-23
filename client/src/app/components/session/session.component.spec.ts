import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSession } from '@common/game-session';
import { SessionComponent } from './session.component';

describe('SessionComponent', () => {
  let component: SessionComponent;
  let fixture: ComponentFixture<SessionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SessionComponent]
    });
    fixture = TestBed.createComponent(SessionComponent);
    component = fixture.componentInstance;

    component.session = {
      pin: '1122',
      game: {
          id: '46277881345',
          lastModification: '2024-02-01T15:04:41.171Z',
          title: 'Questionnaire sur le JS',
          description: 'Questions de pratique sur le langage JavaScript',
          duration: 59,
          questions: [
              {
                  id: '11',
                  type: 'QCM',
                  text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
                  points: 40,
                  choices: [
                      {
                          text: 'var',
                          isCorrect: true,
                      },
                      {
                          text: 'self',
                          isCorrect: false,
                      },
                      {
                          text: 'this',
                          isCorrect: true,
                      },
                      {
                          text: 'int',
                      },
                  ],
              },
              {
                  id: '12',
                  type: 'QCM',
                  text: 'Est-ce que le code suivant lance une erreur : const a = 1/NaN; ? ',
                  points: 20,
                  choices: [
                      {
                          text: 'Non',
                          isCorrect: true,
                      },
                      {
                          text: 'Oui',
                          isCorrect: false,
                      },
                  ],
              },
          ],
          isHidden: false,
      },
      isCompleted: false
  } as unknown as GameSession;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format date correctly', () => {
    const testDate = new Date('2024-03-23T08:15:30');
    
    const expectedFormattedDate = '2024-03-23 08:15:30';

    const formattedDate = component.formatDate(testDate);
 
    expect(formattedDate).toEqual(expectedFormattedDate);
  });

});
