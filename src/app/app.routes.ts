import {Routes, RouterModule, PreloadAllModules} from '@angular/router';
import {ModuleWithProviders} from '@angular/core';
import {DashboardDemoComponent} from './demo/view/dashboarddemo.component';
import {SampleDemoComponent} from './demo/view/sampledemo.component';
import {FormsDemoComponent} from './demo/view/formsdemo.component';
import {DataDemoComponent} from './demo/view/datademo.component';
import {PanelsDemoComponent} from './demo/view/panelsdemo.component';
import {OverlaysDemoComponent} from './demo/view/overlaysdemo.component';
import {MenusDemoComponent} from './demo/view/menusdemo.component';
import {MessagesDemoComponent} from './demo/view/messagesdemo.component';
import {MiscDemoComponent} from './demo/view/miscdemo.component';
import {EmptyDemoComponent} from './demo/view/emptydemo.component';
import {ChartsDemoComponent} from './demo/view/chartsdemo.component';
import {FileDemoComponent} from './demo/view/filedemo.component';
import {UtilsDemoComponent} from './demo/view/utilsdemo.component';
import {DocumentationComponent} from './demo/view/documentation.component';
import { DocUploadComponent } from './doc-upload/doc-upload.component';
import { DocApproveComponent } from './doc-approve/doc-approve.component';
import { DocPostComponent } from './doc-post/doc-post.component';
import { InitLoginComponent } from './init-login/init-login.component';
import { DocReviewComponent } from './doc-review/doc-review.component';
import { MapAccountComponent } from './map-account/map-account.component';
import { DocHistoryComponent } from './doc-history/doc-history.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { HomelayoutComponent } from './homelayout/homelayout.component';
import { LoginlayoutComponent } from './loginlayout/loginlayout.component';
import { SignupComponent } from './signup/signup.component';
import { AuthGuard } from './auth.guard';
import { ForgotpassComponent } from './forgotpass/forgotpass.component';
import { SetpassComponent } from './setpass/setpass.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { SwitchcompanyComponent } from './switchcompany/switchcompany.component';
import { XeroConnectComponent } from './xero-connect/xero-connect.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { ManageItemComponent } from './manage-item/manage-item.component';
import { ManageProductComponent } from './manage-product/manage-product.component';
import { DocEditComponent } from './doc-edit/doc-edit.component';

export const routes: Routes = [
   { path: 'callback', redirectTo:  'initlogin' },
   { path: 'callback', redirectTo:  'initlogin', pathMatch:'full' },
   { path: 'initlogin', component: InitLoginComponent },
    { path: '', component: InitLoginComponent,pathMatch:'full' },
    { path: '', component: InitLoginComponent },
    {
      path: '',
      component: HomelayoutComponent,
      canActivate: [AuthGuard],
      children: [
            
            {path: 'sample', component: SampleDemoComponent},
            {path: 'docupload', component: DocUploadComponent},
            {path: 'docapprove', component: DocApproveComponent},
            {path: 'docreview', component: DocReviewComponent},
            {path: 'docpost', component: DocPostComponent},
            {path: 'myprofile', component: MyProfileComponent},
            {path: 'mapaccount', component: MapAccountComponent},
            {path: 'dochistory', component: DocHistoryComponent},
            {path: 'myaccount', component: MyAccountComponent},
            {path: 'switchcompany', component: SwitchcompanyComponent},
            {path: 'logout', component: LogoutComponent},
            { path: 'xeroconnect',  component: XeroConnectComponent },
            {path: 'manageitem', component: ManageItemComponent},
            {path: 'manageproduct', component: ManageProductComponent},
            { path: 'docedit/:id', component: DocEditComponent },
      ]
    },
    {
      path: '',
      component: LoginlayoutComponent,
      children: [
        { path: 'login',  component: LoginComponent },
        { path: 'signup',  component: SignupComponent },
        { path: 'forgotpass',  component: ForgotpassComponent },
        { path: 'setpass',  component: SetpassComponent },
        { path: 'welcome',  component: WelcomeComponent },
         {path: 'initlogin/:token/:connectid/:returnUrl', component: InitLoginComponent, pathMatch: 'full'}
      ]
    }
 
  ];


export const AppRoutes: ModuleWithProviders = RouterModule.forRoot(routes,{ useHash : true});
