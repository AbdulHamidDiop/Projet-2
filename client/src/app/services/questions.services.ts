import { Game, Question } from '@common/game';
// import * as fs from 'fs/promises';
// import { Service } from 'typedi';
import { Injectable } from '@angular/core';

// const QUESTIONS_PATH = '../../../../server/assets/questions-database.json';
// const QUIZ_PATH = '../../../../server/assets/quiz-example.json';

// @Service()
@Injectable({
    providedIn: 'root',
})
export class QuestionsService {
    async getAllQuestions(): Promise<Question[]> {
        // const data: string = await fs.readFile(QUESTIONS_PATH, 'utf8');
        // const questions: Question[] = JSON.parse(data);
        // return questions;
        return [];
    }

    async sortAllQuestions(): Promise<Question[]> {
        const questions: Question[] = await this.getAllQuestions();
        const sortedQuestions: Question[] = questions.sort((a, b) => new Date(a.lastModification).getTime() - new Date(b.lastModification).getTime());
        return sortedQuestions;
    }

    // eslint-disable-next-line no-unused-vars
    async addGame(game: Game): Promise<void> {
        // const games: Game[] = await this.getAllGames();
        // if (games.find((g) => g.id === game.id)) {
        //     games.splice(
        //         games.findIndex((g) => g.id === game.id),
        //         1,
        //     );
        // }
        // games.push(game);
        // await fs.writeFile(QUIZ_PATH, JSON.stringify(games, null, 2), 'utf8');
    }

    async getAllGames(): Promise<Game[]> {
        // const data: string = await fs.readFile(QUIZ_PATH, 'utf8');
        // const games: Game[] = JSON.parse(data);
        // return games;
        return [];
    }

    async getGameByID(id: string): Promise<Game> {
        const games: Game[] = await this.getAllGames();
        const game = games.find((g) => g.id === id);
        if (!game) {
            throw new Error('Game not found');
        }
        return game;
    }

    // TODO ajouter delte, modify, get et add question
    async addQuestion(question: Question): Promise<void> {
        const questions: Question[] = await this.getAllQuestions();
        if (questions.find((q) => q.id === question.id)) {
            questions.splice(
                questions.findIndex((q) => q.id === question.id),
                1,
            );
        }
        questions.push(question);
        // await fs.writeFile(QUESTIONS_PATH, JSON.stringify(questions, null, 2), 'utf8');
    }

    // eslint-disable-next-line no-unused-vars
    async toggleGameHidden(id: string): Promise<boolean> {
        // const games: Game[] = await this.getAllGames();
        // const updatedGames: Game[] = games.map((game) =>
        //     game.id === id ? { ...game, lastModification: new Date(), isHidden: !game.isHidden } : game,
        // );
        // await fs.writeFile(QUIZ_PATH, JSON.stringify(updatedGames, null, 2), 'utf8');
        return true;
    }

    // eslint-disable-next-line no-unused-vars
    async deleteGameByID(id: string): Promise<boolean> {
        // const games: Game[] = await this.getAllGames();
        // const updatedGames: Game[] = games.filter((game) => game.id !== id);
        // await fs.writeFile(QUIZ_PATH, JSON.stringify(updatedGames, null, 2), 'utf8');
        return true;
    }
}
