import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// import { HttpModule } from '@angular/http';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutes } from './app.routes';


import { AccordionModule, ConfirmationService } from 'primeng/primeng';
import { AutoCompleteModule } from 'primeng/primeng';
import { BreadcrumbModule } from 'primeng/primeng';
import { ButtonModule } from 'primeng/primeng';
import { CalendarModule } from 'primeng/primeng';
import { CarouselModule } from 'primeng/primeng';
import { ChartModule } from 'primeng/primeng';
import { ColorPickerModule } from 'primeng/primeng';
import { CheckboxModule } from 'primeng/primeng';
import { ChipsModule } from 'primeng/primeng';
import { CodeHighlighterModule } from 'primeng/primeng';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SharedModule } from 'primeng/primeng';
import { ContextMenuModule } from 'primeng/primeng';
import { DataGridModule } from 'primeng/primeng';
import { DataListModule } from 'primeng/primeng';
import { DataScrollerModule } from 'primeng/primeng';
import { DataTableModule } from 'primeng/primeng';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/primeng';
import { DragDropModule } from 'primeng/primeng';
import { DropdownModule } from 'primeng/primeng';
import { EditorModule } from 'primeng/primeng';
import { FieldsetModule } from 'primeng/primeng';
import { FileUploadModule } from 'primeng/primeng';
import { GalleriaModule } from 'primeng/primeng';
import { GMapModule } from 'primeng/primeng';
import { GrowlModule } from 'primeng/primeng';
import { InputMaskModule } from 'primeng/primeng';
import { InputSwitchModule } from 'primeng/primeng';
import { InputTextModule } from 'primeng/primeng';
import { InputTextareaModule } from 'primeng/primeng';
import { LightboxModule } from 'primeng/primeng';
import { ListboxModule } from 'primeng/primeng';
import { MegaMenuModule } from 'primeng/primeng';
import { MenuModule } from 'primeng/primeng';
import { MenubarModule } from 'primeng/primeng';
import { MessagesModule } from 'primeng/primeng';
import { MultiSelectModule } from 'primeng/primeng';
import { OrderListModule } from 'primeng/primeng';
import { OrganizationChartModule } from 'primeng/primeng';
import { OverlayPanelModule } from 'primeng/primeng';
import { PaginatorModule } from 'primeng/primeng';
import { PanelModule } from 'primeng/primeng';
import { PanelMenuModule } from 'primeng/primeng';
import { PasswordModule } from 'primeng/primeng';
import { PickListModule } from 'primeng/primeng';
import { ProgressBarModule } from 'primeng/primeng';
import { RadioButtonModule } from 'primeng/primeng';
import { RatingModule } from 'primeng/primeng';
import { ScheduleModule } from 'primeng/primeng';
import { ScrollPanelModule } from 'primeng/primeng';
import { SelectButtonModule } from 'primeng/primeng';
import { SlideMenuModule } from 'primeng/primeng';
import { SliderModule } from 'primeng/primeng';
import { SpinnerModule } from 'primeng/primeng';
import { SplitButtonModule } from 'primeng/primeng';
import { StepsModule } from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/primeng';
import { TabViewModule } from 'primeng/primeng';
import { TerminalModule } from 'primeng/primeng';
import { TieredMenuModule } from 'primeng/primeng';
import { ToggleButtonModule } from 'primeng/primeng';
import { ToolbarModule } from 'primeng/primeng';
import { TooltipModule } from 'primeng/primeng';
import { TreeModule } from 'primeng/primeng';
import { TreeTableModule } from 'primeng/primeng';
import { CardModule } from 'primeng/primeng';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { AppComponent } from './app.component';
import { AppMenuComponent, AppSubMenuComponent } from './app.menu.component';
import { DashboardDemoComponent } from './demo/view/dashboarddemo.component';
import { SampleDemoComponent } from './demo/view/sampledemo.component';
import { FormsDemoComponent } from './demo/view/formsdemo.component';
import { DataDemoComponent } from './demo/view/datademo.component';
import { PanelsDemoComponent } from './demo/view/panelsdemo.component';
import { OverlaysDemoComponent } from './demo/view/overlaysdemo.component';
import { MenusDemoComponent } from './demo/view/menusdemo.component';
import { MessagesDemoComponent } from './demo/view/messagesdemo.component';
import { MiscDemoComponent } from './demo/view/miscdemo.component';
import { EmptyDemoComponent } from './demo/view/emptydemo.component';
import { ChartsDemoComponent } from './demo/view/chartsdemo.component';
import { FileDemoComponent } from './demo/view/filedemo.component';
import { UtilsDemoComponent } from './demo/view/utilsdemo.component';
import { DocumentationComponent } from './demo/view/documentation.component';

import { CarService } from './demo/service/carservice';
import { CountryService } from './demo/service/countryservice';
import { EventService } from './demo/service/eventservice';
import { NodeService } from './demo/service/nodeservice';

import { DocUploadComponent } from './doc-upload/doc-upload.component';
import { DocApproveComponent } from './doc-approve/doc-approve.component';
import { DocPostComponent } from './doc-post/doc-post.component';
import { InitLoginComponent } from './init-login/init-login.component';
import { StorageServiceModule } from 'angular-webstorage-service'
import { NgxSpinnerModule } from 'ngx-spinner';
import { SimplePdfViewerModule } from 'simple-pdf-viewer';
import { DocReviewComponent } from './doc-review/doc-review.component';
import { MapAccountComponent } from './map-account/map-account.component';
import { DocHistoryComponent } from './doc-history/doc-history.component';
import { MyAccountComponent } from './my-account/my-account.component';


import { ApiService } from './api.service';
import { StoreService } from './store.service';
import { LogoutComponent } from './logout/logout.component';
import { LoginComponent } from './login/login.component';
import { LoginlayoutComponent } from './loginlayout/loginlayout.component';
import { HomelayoutComponent } from './homelayout/homelayout.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotpassComponent } from './forgotpass/forgotpass.component';
import { SetpassComponent } from './setpass/setpass.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { SwitchcompanyComponent } from './switchcompany/switchcompany.component';
import { XeroConnectComponent } from './xero-connect/xero-connect.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { EncryptingService } from './encrypting.service';
import { ManageProductComponent } from './manage-product/manage-product.component';
import { ManageItemComponent } from './manage-item/manage-item.component';
import { DocEditComponent } from './doc-edit/doc-edit.component';
import { DocAuthComponent } from './doc-auth/doc-auth.component';
import { ParameterHashLocationStrategy } from './ParameterHashLocationStrategy';
import { CacheInterceptor } from './CacheInterceptor';
import { PackagePurchaseHelper } from './PackagePurchaseHelper';
import { CosmicNotifyService } from './CosmicNotifyService';
import { RecaptchaModule } from "ng-recaptcha";
import { AutoxignupxeroComponent } from './AutoSignupXero/autoxignupxero.component';
import { LaunchPageComponent } from './launch-page/launch-page.component';
import { SelectCompanyDialogComponent } from './Dialog/components/select-company-dialog/select-company-dialog.component';



@NgModule({
    imports: [
        RecaptchaModule,
        ReactiveFormsModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutes,
        HttpClientModule,
        AccordionModule,
        AutoCompleteModule,
        BreadcrumbModule,
        ButtonModule,
        CardModule,
        CalendarModule,
        CarouselModule,
        ChartModule,
        ColorPickerModule,
        CheckboxModule,
        ChipsModule,
        CodeHighlighterModule,
        ConfirmDialogModule,
        SharedModule,
        ContextMenuModule,
        DataGridModule,
        DataListModule,
        DataScrollerModule,
        DataTableModule,
        DataViewModule,
        DialogModule,
        DragDropModule,
        DropdownModule,
        EditorModule,
        FieldsetModule,
        FileUploadModule,
        GalleriaModule,
        GMapModule,
        GrowlModule,
        InputMaskModule,
        InputSwitchModule,
        InputTextModule,
        InputTextareaModule,
        LightboxModule,
        ListboxModule,
        MegaMenuModule,
        MenuModule,
        MenubarModule,
        MessagesModule,
        MultiSelectModule,
        OrderListModule,
        OrganizationChartModule,
        OverlayPanelModule,
        PaginatorModule,
        PanelModule,
        PanelMenuModule,
        PasswordModule,
        PickListModule,
        ProgressBarModule,
        RadioButtonModule,
        RatingModule,
        ScheduleModule,
        ScrollPanelModule,
        SelectButtonModule,
        SlideMenuModule,
        SliderModule,
        SpinnerModule,
        SplitButtonModule,
        StepsModule,
        TableModule,
        TabMenuModule,
        TabViewModule,
        TerminalModule,
        TieredMenuModule,
        ToggleButtonModule,
        ToolbarModule,
        TooltipModule,
        TreeModule,
        TreeTableModule,
        BrowserAnimationsModule,
        StorageServiceModule,
        NgxSpinnerModule,
        SimplePdfViewerModule,
        ProgressSpinnerModule

    ],
    declarations: [
        AppComponent,
        AppMenuComponent,
        AppSubMenuComponent,
        DashboardDemoComponent,
        SampleDemoComponent,
        FormsDemoComponent,
        DataDemoComponent,
        PanelsDemoComponent,
        OverlaysDemoComponent,
        MenusDemoComponent,
        MessagesDemoComponent,
        MessagesDemoComponent,
        MiscDemoComponent,
        ChartsDemoComponent,
        EmptyDemoComponent,
        FileDemoComponent,
        UtilsDemoComponent,
        DocumentationComponent,
        DocUploadComponent,
        DocApproveComponent,
        DocPostComponent,
        InitLoginComponent,
        DocReviewComponent,
        MapAccountComponent,
        DocHistoryComponent,
        MyAccountComponent,
        LogoutComponent,
        LoginComponent,
        LoginlayoutComponent,
        HomelayoutComponent,
        SignupComponent,
        ForgotpassComponent,
        SetpassComponent,
        WelcomeComponent,
        SwitchcompanyComponent,
        XeroConnectComponent,
        MyProfileComponent,
        ManageProductComponent,
        ManageItemComponent,
        DocEditComponent,
        DocAuthComponent,
        AutoxignupxeroComponent,
        LaunchPageComponent,
        SelectCompanyDialogComponent
    ],
    providers: [
        CarService, CountryService, ConfirmDialogModule, EventService, ConfirmationService, NodeService, ApiService, StoreService, EncryptingService, CosmicNotifyService,
        {
            provide: LocationStrategy,
            useClass: ParameterHashLocationStrategy
        }
    ],

    bootstrap: [AppComponent]
})
export class AppModule { }
