
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, isDevMode } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
//import { DialogConfirm } from './lista-activos/lista-activos.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { InicioComponent } from './inicio/inicio.component';
import { MatTableModule } from '@angular/material/table';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSelectModule} from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
//import { DialogRevisar } from './lista-activos/lista-activos.component';
import { DialogDetalleReqAdm, DialogCreateOrden, RequisitionsComponent } from './requisitions/requisitions.component';
import { DialogDetalleReqAsist } from './requisitions/requisitions.component';
import { DialogDetalleReqUsr } from './requisitions/requisitions.component';
import { MatCardModule } from '@angular/material/card';

import { ToastrModule } from 'ngx-toastr';

import { MatTableExporterModule } from 'mat-table-exporter';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { DialogNewD, DialogNewR, DialogConfirm, NuevoComponent } from './nuevo/nuevo.component';

import { MatGridListModule} from '@angular/material/grid-list';
import { GoogleChartsModule } from 'angular-google-charts';
import { CookieService } from 'ngx-cookie-service';
import { LoginComponent } from './login/login.component';

import { MatStepperModule} from '@angular/material/stepper';

import { FondoComponent, DialogNewItemFondo, DialogConfirmFondo, DialogEditItemFondo } from './fondo/fondo.component';
import { DialogConfirmOrden, OrdenComponent } from './orden/orden.component';
import { UsersComponent, DialogNewUser, DialogEditUser } from './users/users.component';
import { CategoriesComponent, DialogNewCategory, DialogEditCategory } from './categories/categories.component';
import { CampusComponent, DialogNewCampus, DialogEditCampus } from './campus/campus.component';
import { AreasComponent, DialogNewArea, DialogEditArea } from './areas/areas.component';
import { ProvidersComponent, DialogNewProvider, DialogEditProvider, DialogNewProduct, DialogEditProduct } from './providers/providers.component';
import { MatSlideToggleModule} from '@angular/material/slide-toggle';

import { DialogAddReceiptWarehouse, DialogEditReceiptWarehouse, WarehouseComponent } from './warehouse/warehouse.component';
import { MatTabsModule} from '@angular/material/tabs';
import { DialogNewItemMobility, DialogConfirmMobility, DialogEditItemMobility, MobilityComponent} from './mobility/mobility.component';

import { AnalyticsComponent } from './analytics/analytics.component';
import { MatProgressBarModule} from '@angular/material/progress-bar';

import { DailyComponent, DialogConfirmDaily } from './daily/daily.component';

import { ActivitiesComponent } from './activities/activities.component';

import { DialogAddReceipt, DialogEditReceipt, DialogShowDocs, DialogNewDoc, DialogEditDoc } from './orden/orden.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { EntregaComponent,DialogEditItemEntrega,DialogNewItemEntrega,DialogConfirmEntrega } from './entrega/entrega.component';

import { IntegerPositiveDirective } from './integer-positive.directive';
import { FloatPositiveDirective } from './integer-positive.directive';
import { ServiceWorkerModule } from '@angular/service-worker';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { OrdenV2Component } from './orden-v2/orden-v2.component';
import { OrdenSupervisor } from './orden-Supervisor/orden-Supervisor.component';


import { PushNotificationService } from './push-notification.service';
import { environment } from 'src/environments/environment';
import { RequirementsComponent } from "./analytics/requirements/requirements.component";
import { OrdersComponent } from "./analytics/orders/orders.component";
import { ImprestComponent } from "./analytics/imprest/imprest.component";
import { DeliveryComponent } from "./analytics/delivery/delivery.component"
import { AnalyticMobilityComponent } from './analytics/analytic-mobility/analytic-mobility.component';


@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        NuevoComponent,
        OrdenComponent,
        WarehouseComponent,
        InicioComponent,
        FondoComponent,
        //DialogRevisar,
        DialogDetalleReqAdm,
        DialogDetalleReqAsist,
        DialogDetalleReqUsr,
        DialogCreateOrden,
        DialogConfirmOrden,
        DialogNewD,
        DialogNewR,
        DialogConfirm,
        DialogNewItemFondo,
        UsersComponent,
        DialogNewUser,
        DialogEditUser,
        CategoriesComponent,
        DialogNewCategory,
        DialogEditCategory,
        CampusComponent,
        DialogNewCampus,
        DialogEditCampus,
        AreasComponent,
        DialogNewArea,
        DialogEditArea, 
        ProvidersComponent,
        DialogNewProvider,
        DialogEditProvider,
        DialogNewProduct,
        DialogEditProduct,
        DialogConfirmFondo,
        DialogEditItemFondo,
        DialogNewItemMobility,
        DialogEditItemMobility,
        DialogConfirmMobility,
        AnalyticsComponent,
        DailyComponent,
        DialogConfirmDaily,
        ActivitiesComponent,
        DialogAddReceipt,
        DialogEditReceipt,
        DialogAddReceiptWarehouse,
        DialogEditReceiptWarehouse,
        DialogShowDocs,
        DialogNewDoc,
        DialogEditDoc,
        NavBarComponent,
        SideNavComponent,
        IntegerPositiveDirective,
        FloatPositiveDirective,
        EntregaComponent,
        DialogEditItemEntrega,
        DialogNewItemEntrega,
        DialogConfirmEntrega,
        OrdenV2Component,
        MobilityComponent,
        RequisitionsComponent,
        OrdenSupervisor
    ],
    imports: [
    BrowserModule,
    AppRoutingModule,

    FormsModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    HttpClientModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatTableExporterModule,
    MatGridListModule,
    GoogleChartsModule,
    MatStepperModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatProgressBarModule,
    DragDropModule,
    ToastrModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', {
        enabled: !isDevMode(),
        // Register the ServiceWorker as soon as the application is stable
        // or after 30 seconds (whichever comes first).
        registrationStrategy: 'registerWhenStable:30000'
    }),
    OrdersComponent,
    ImprestComponent,
    DeliveryComponent,
    AnalyticMobilityComponent,
    RequirementsComponent,
    
],
    providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy },
      { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, CookieService,PushNotificationService],
    bootstrap: [AppComponent]
})
export class AppModule { }
