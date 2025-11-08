import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ContactsComponent } from './contacts/contacts.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: ContactsComponent },
];

@NgModule({
  declarations: [
    ContactsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ],

})
export class ContactsModule {}
