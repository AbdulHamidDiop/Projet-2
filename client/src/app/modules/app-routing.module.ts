import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StatsTestComponent } from '@app/components/stats-test/stats-test.component';
import { AdminCreateGamePageComponent } from '@app/pages/admin-create-game-page/admin-create-game-page.component';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { QuestionsPageComponent } from '@app/pages/admin-page/questions-page/questions-page.component';
import { CreateGamePageComponent } from '@app/pages/create-game-page/create-game-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { WaitingPageComponent } from '@app/pages/waiting-page/waiting-page.component';
import { ResultsPageComponent } from '@app/pages/results-page/results-page.component';

const routes: Routes = [
    { path: 'stats-test', component: StatsTestComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game/:id', component: GamePageComponent },
    { path: 'game/:id/results', component: ResultsPageComponent },
    { path: 'createGame', component: CreateGamePageComponent },
    { path: 'admin', component: AdminPageComponent },
    { path: 'admin/questions', component: QuestionsPageComponent },
    { path: 'admin/createGame', component: AdminCreateGamePageComponent },
    { path: 'admin/createGame/:id', component: AdminCreateGamePageComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'waiting', component: WaitingPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
