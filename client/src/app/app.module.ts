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
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { CreateQuestionDialogComponent } from './components/create-question-dialog/create-question-dialog.component';
import { AdminCreateGamePageComponent } from './pages/admin-create-game-page/admin-create-game-page.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { CreateGamePageComponent } from './pages/create-game-page/create-game-page.component';
import { AdminQuestionComponent } from './components/admin-question/admin-question.component';
import { AdminQuestionsBankComponent } from './components/admin-questions-bank/admin-questions-bank.component';
import { QuestionsBankService } from './services/questions-bank.service';

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
        MainPageComponent,
        MaterialPageComponent,
        AdminPageComponent,
        AdminCreateGamePageComponent,
        CreateQuestionDialogComponent,
        PlayAreaComponent,
        SidebarComponent,
        AdminQuestionComponent,
        AdminQuestionsBankComponent,
    ],
    // eslint-disable-next-line prettier/prettier
    imports: [
        AppMaterialModule, 
        AppRoutingModule, 
        AppReactiveFormsModule, 
        BrowserAnimationsModule, 
        BrowserModule, 
        FormsModule, 
        HttpClientModule
    ],
    providers: [QuestionsBankService],
    bootstrap: [AppComponent],
})
export class AppModule {}
