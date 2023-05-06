import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListComponent } from './list/list.component';
import { EditorComponent } from './editor/editor.component';
import { EditorDenyComponent } from './editor-deny/editor-deny.component';
import { canActivate } from './editor.can-activate';

const routes: Routes = [
    {
        path: 'edit/invalid',
        component: EditorDenyComponent,
    },
    {
        path: 'edit/:namespace/:raw',
        component: EditorComponent,
        canActivate: [canActivate],
    },
    {
        path: 'edit/:namespace',
        redirectTo: '/edit/:namespace/*new',
    },
    {
        path: 'edit',
        redirectTo: '/edit/artist/*new',
    },
    {
        path: 'list/:namespace',
        component: ListComponent,
    },
    {
        path: 'list',
        redirectTo: '/list/all',
    },
    {
        path: '**',
        redirectTo: '/list/all',
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    providers: [],
    exports: [RouterModule],
})
export class AppRoutingModule {}
