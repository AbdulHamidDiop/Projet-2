import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game-elements';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    getGameById(id: string): Observable<Game> {
        const dummyGame: Game = {
            // eslint-disable-next-line object-shorthand
            id: id,
            title: 'Game title',
            description: 'Game description',
            duration: 10,
            lastModification: new Date(),
            questions: [
                {
                    type: 'QCM',
                    text: 'Question 1',
                    points: 10,
                    choices: [
                        {
                            text: 'Choice 1',
                            isCorrect: true,
                        },
                        {
                            text: 'Choice 2',
                            isCorrect: false,
                        },
                        {
                            text: 'Choice 3',
                            isCorrect: false,
                        },
                    ],
                    answer: '',
                },
                {
                    type: 'QRL',
                    text: 'Question 2',
                    points: 20,
                    choices: [],
                    answer: 'Answer',
                },
            ],
            visible: true,
        };
        return of(dummyGame);
    }
}
