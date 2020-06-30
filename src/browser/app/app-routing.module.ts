import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListComponent } from './list/list.component';
import { EditorComponent } from './editor/editor.component';
import { AboutComponent } from './about/about.component';

const routes: Routes = [
    {
        path: 'edit/:namespace/:raw',
        component: EditorComponent,
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
        path: 'about',
        component: AboutComponent,
    },
    {
        path: '**',
        redirectTo: '/list/all',
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
