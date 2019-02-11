import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './index/index.component';
import {ListComponent} from './list/list.component';
import {FormComponent} from './form/form.component';

const routes: Routes = [
  {
    path: '', component: IndexComponent, data: { title: '首页' },
    children: [
      { path: '', redirectTo: 'list/artist', pathMatch: 'full'},
      { path: 'list/:namespace', component: ListComponent, data: { title: '列表' }},
      { path: 'form/:namespace/:tag', component: FormComponent, data: { title: '编辑' }},
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
