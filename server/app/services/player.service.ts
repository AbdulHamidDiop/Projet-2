import { Service } from 'typedi';
import { Choices, Player, Question, Game } from '@common/game';

@Service()
export class PlayerService {
    private players: Player[] = [];
    private game: Game;

    getAllPlayers(): Player[] {
        return this.players;
    }

    addPlayer(player: Player): void {
        this.players.push(player);
    }

    getPlayerById(id: string): Player | undefined {
        return this.players.find((player) => player.id === id);
    }

    updatePlayer(player: Player): void {
        const index = this.players.findIndex((p) => p.id === player.id);
        if (index !== -1) {
            this.players[index] = player;
        }
    }

    removePlayer(id: string): void {
        this.players = this.players.filter((player) => player.id !== id);
    }

    updateChoice(choice: Choices, question: Question): void {
        const questionToUpdate = this.game.questions.find((q) => q.id === question.id);

        if (questionToUpdate) {
            const choiceToUpdate = questionToUpdate.choices.find((c) => c.text === choice.text);

            if (choiceToUpdate) {
                choiceToUpdate.numberAnswered++;
            }
        }
    }
}
