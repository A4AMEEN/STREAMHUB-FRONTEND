import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdminHomeComponent } from '../component/Admin-home/admin-home.component';
import { UsersComponent } from '../component/admin/Users/users.component';
import { AdminChannelComponent } from '../component/admin/Admin-channel/admin-channel.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CategoriesComponent } from '../component/admin/Admin-channel/Categories/categories.component';
const routes: Routes = [
  { 
    path: '', 
    component: AdminHomeComponent,
    children: [
      { path: 'users', component: UsersComponent },
      { path: 'channels', component: AdminChannelComponent },
      { path: 'categories', component: CategoriesComponent }
    ]
  }
];

@NgModule({
  declarations: [
    AdminHomeComponent,
    UsersComponent,
    CategoriesComponent,
    AdminChannelComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class AdminModule { }