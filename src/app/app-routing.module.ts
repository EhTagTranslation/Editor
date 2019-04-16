import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ListComponent } from './list/list.component';
import { EditorComponent } from './editor/editor.component';

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
    path: '',
    component: HomeComponent,
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
