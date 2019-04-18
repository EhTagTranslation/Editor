import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ehHttpInterceptorProvider } from 'src/services/eh-http-interceptor';
import { UserComponent } from './user/user.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatMenuModule,
  MatTableModule,
  MatIconModule,
  MatPaginatorModule,
  MatFormFieldModule,
  MatInputModule,
  MatSortModule,
  MatProgressSpinnerModule,
  MatTooltipModule,
  MatChipsModule,
  MatButtonToggleModule,
  MatSelectModule,
  MatCardModule,
  MatProgressBarModule
} from '@angular/material';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ListComponent } from './list/list.component';
import { EditorComponent } from './editor/editor.component';
import { AboutComponent } from './about/about.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MarkPipe } from './shared/pipe/mark.pipe';
import { TextFieldModule } from '@angular/cdk/text-field';
import { TitleService } from 'src/services/title.service';

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
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatMenuModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatSelectModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    TextFieldModule,
  ],
  providers: [ehHttpInterceptorProvider, TitleService],
  bootstrap: [AppComponent]
})
export class AppModule { }
