import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HostGameViewComponent } from '@app/components/host-game-view/host-game-view.component';
import { AdminCreateGamePageComponent } from '@app/pages/admin-create-game-page/admin-create-game-page.component';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { QuestionsPageComponent } from '@app/pages/admin-page/questions-page/questions-page.component';
import { CreateGamePageComponent } from '@app/pages/create-game-page/create-game-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { ResultsPageComponent } from '@app/pages/results-page/results-page.component';
import { WaitingPageComponent } from '@app/pages/waiting-page/waiting-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: WaitingPageComponent },
    { path: 'game/:id', component: GamePageComponent },
    { path: 'hostView/:id', component: HostGameViewComponent },
    { path: 'game/:id/results', component: ResultsPageComponent },
    { path: 'results', component: ResultsPageComponent },
    { path: 'createGame', component: CreateGamePageComponent },
    { path: 'admin', component: AdminPageComponent },
    { path: 'admin/questions', component: QuestionsPageComponent },
    { path: 'admin/createGame', component: AdminCreateGamePageComponent },
    { path: 'admin/createGame/:id', component: AdminCreateGamePageComponent },
    { path: 'waiting', redirectTo: '/home' },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
