import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ehHttpInterceptorProvider } from 'src/services/eh-http-interceptor';
import { UserComponent } from './user/user.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ListComponent } from './list/list.component';
import { EditorComponent } from './editor/editor.component';
import { AboutComponent } from './about/about.component';
@NgModule({
  declarations: [
    AppComponent,
    UserComponent,
    ListComponent,
    EditorComponent,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatToolbarModule,
  ],
  providers: [ehHttpInterceptorProvider],
  bootstrap: [AppComponent]
})
export class AppModule { }
