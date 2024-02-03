import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

const modules = [ReactiveFormsModule];

/**
 * Material module
 * IMPORTANT : IMPORT ONLY USED MODULES !!!!!!
 */
@NgModule({
    imports: [...modules],
    exports: [...modules],
    providers: [],
})
export class AppReactiveFormsModule {}
