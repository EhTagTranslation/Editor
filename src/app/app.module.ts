import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ehHttpInterceptorProvider } from 'src/services/eh-http-interceptor';
import { UserComponent } from './user/user.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatMenuModule,
  MatTableModule,
  MatIconModule,
  MatPaginatorModule,
  MatFormFieldModule,
  MatInputModule,
  MatSortModule,
  MatProgressSpinnerModule,
  MatTooltipModule
} from '@angular/material';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ListComponent } from './list/list.component';
import { EditorComponent } from './editor/editor.component';
import { AboutComponent } from './about/about.component';
import { FormsModule } from '@angular/forms';
import { MarkPipe } from './shared/pipe/mark.pipe';

@NgModule({
  declarations: [
    AppComponent,
    UserComponent,
    ListComponent,
    EditorComponent,
    AboutComponent,
    MarkPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
    MatTableModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FormsModule,
  ],
  providers: [ehHttpInterceptorProvider],
  bootstrap: [AppComponent]
})
export class AppModule { }
