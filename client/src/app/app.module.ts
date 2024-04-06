import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppReactiveFormsModule } from '@app/modules/reactive-forms.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { NgChartsModule } from 'ng2-charts';
import { AdminButtonComponent } from './components/admin-button/admin-button.component';
import { AdminQuestionComponent } from './components/admin-question/admin-question.component';
import { AdminQuestionsBankComponent } from './components/admin-questions-bank/admin-questions-bank.component';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { CountdownModalComponent } from './components/countdown-modal/countdown-modal.component';
import { CreateQuestionDialogComponent } from './components/create-question-dialog/create-question-dialog.component';
import { FooterComponent } from './components/footer/footer.component';
import { GameCardComponent } from './components/game-card/game-card.component';
import { GameListComponent } from './components/game-list/game-list.component';
import { HostGameViewComponent } from './components/host-game-view/host-game-view.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { PlayerAndAdminPanelComponent } from './components/player-and-admin-panel/player-and-admin-panel.component';
import { SelectRoomComponent } from './components/select-room/select-room.component';
import { SelectUsernameComponent } from './components/select-username/select-username.component';
import { StatsTestComponent } from './components/stats-test/stats-test.component';
import { AdminCreateGamePageComponent } from './pages/admin-create-game-page/admin-create-game-page.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { QuestionsPageComponent } from './pages/admin-page/questions-page/questions-page.component';
import { CreateGamePageComponent } from './pages/create-game-page/create-game-page.component';
import { ResultsPageComponent } from './pages/results-page/results-page.component';
import { WaitingPageComponent } from './pages/waiting-page/waiting-page.component';
import { GameService } from './services/game.service';
import { QuestionsService } from './services/questions.service';
import { SocketRoomService } from './services/socket-room.service';
import { PlayerListComponent } from './components/player-list/player-list.component';
import { GameRandomComponent } from './components/game-random/game-random.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        CreateGamePageComponent,
        AdminPageComponent,
        AdminCreateGamePageComponent,
        CreateQuestionDialogComponent,
        AdminCreateGamePageComponent,
        CreateQuestionDialogComponent,
        PlayAreaComponent,
        SidebarComponent,
        GameListComponent,
        WaitingPageComponent,
        QuestionsPageComponent,
        QuestionsPageComponent,
        GameCardComponent,
        AdminQuestionComponent,
        AdminQuestionsBankComponent,
        ConfirmDialogComponent,
        NavBarComponent,
        CountdownModalComponent,
        StatsTestComponent,
        HostGameViewComponent,
        ResultsPageComponent,
        BarChartComponent,
        CountdownModalComponent,
        StatsTestComponent,
        SelectRoomComponent,
        SelectUsernameComponent,
        PlayerAndAdminPanelComponent,
        ResultsPageComponent,
        AdminButtonComponent,
        FooterComponent,
        PlayerListComponent,
        GameRandomComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        AppReactiveFormsModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        NgChartsModule,
    ],
    providers: [GameService, QuestionsService, SocketRoomService],
    bootstrap: [AppComponent],
})
export class AppModule {}
