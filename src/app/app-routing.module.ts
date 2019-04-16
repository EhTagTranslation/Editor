import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListComponent } from './list/list.component';
import { EditorComponent } from './editor/editor.component';
import { AboutComponent } from './about/about.component';

const routes: Routes = [
  {
    path: 'edit/:ns/:raw',
    component: EditorComponent,
  },
  {
    path: 'list',
    component: ListComponent,
    children: [
      {
        path: ':ns',
        component: ListComponent,
      }
    ]
  },
  {
    path: 'about',
    component: AboutComponent,
  },
  {
    path: '**',
    redirectTo: '/list',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
