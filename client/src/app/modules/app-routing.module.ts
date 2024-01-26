import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminCreateGamePageComponent } from '@app/pages/admin-create-game-page/admin-create-game-page.component';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { QuestionsPageComponent } from '@app/pages/admin-page/questions-page/questions-page.component';
import { CreateGamePageComponent } from '@app/pages/create-game-page/create-game-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { WaitingPageComponent } from '@app/pages/waiting-page/waiting-page.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'createGame', component: CreateGamePageComponent },
    { path: 'admin', component: AdminPageComponent },
    { path: 'admin/questions', component: QuestionsPageComponent},
    { path: 'admin/CreateGame', component: AdminCreateGamePageComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'waiting', component: WaitingPageComponent},
    { path: 'playArea/:id', component: PlayAreaComponent},
    { path: '**', redirectTo: '/home' },
    
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
