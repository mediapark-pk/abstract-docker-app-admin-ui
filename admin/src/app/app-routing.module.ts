import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SigninComponent} from "./signin/signin.component";
import {AuthComponent} from "./auth/auth.component";
import {DashboardComponent} from "./auth/dashboard/dashboard.component";
import {MyAccountComponent} from "./auth/my-account/my-account.component";

const routes: Routes = [
  {path: '', component: SigninComponent},
  {path: 'signin', component: SigninComponent},
  {
    path: 'auth',
    component: AuthComponent,
    children: [
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      {path: 'dashboard', component: DashboardComponent},
      {path: 'my_account', component: MyAccountComponent},

    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
