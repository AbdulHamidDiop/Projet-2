import { Component, Injectable, Injector } from '@angular/core';
import {GameProps, Question} from '../../interfaces/game-props';

@Component({
    selector: 'game-root',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css']
  })

@Injectable({
    providedIn: 'root', 
})

export class GameComponent {
  private description: string;
  private timeLimitInSeconds: number;
  private questions: Question[];

  constructor(private injector: Injector) {}

  setProps(props: GameProps): void {
    this.description = props.description;
    this.timeLimitInSeconds = props.timeLimitInSeconds;
    this.questions = props.questions;}
  }