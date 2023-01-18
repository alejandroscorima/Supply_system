
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
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
import { DialogCreateOrden, InicioComponent } from './inicio/inicio.component';
import { MatTableModule } from '@angular/material/table';
import { HttpClientModule } from '@angular/common/http';
import { DialogHistoryDetail, DialogLudops, HistoryComponent } from './history/history.component';
import { MatDialogModule } from '@angular/material/dialog';
import { GenerarActaComponent } from './generar-acta/generar-acta.component';
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
import { DialogDetalleReqAdm } from './inicio/inicio.component';
import { DialogDetalleReqAsist } from './inicio/inicio.component';
import { DialogDetalleReqUsr } from './inicio/inicio.component';
import { MatCardModule } from '@angular/material/card';

import { ToastrModule } from 'ngx-toastr';

import { MatTableExporterModule } from 'mat-table-exporter';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { DialogNewD, DialogNewR, DialogConfirm, NuevoComponent } from './nuevo/nuevo.component';
import { BirthdayComponent } from './birthday/birthday.component';

import { MatGridListModule} from '@angular/material/grid-list';
import { GoogleChartsModule } from 'angular-google-charts';
import { CookieService } from 'ngx-cookie-service';
import { LoginComponent } from './login/login.component';

import { MatStepperModule} from '@angular/material/stepper';

import { FondoComponent, DialogNewItemFondo, DialogConfirmFondo, DialogEditItemFondo } from './fondo/fondo.component';
import { DialogConfirmOrden, OrdenComponent } from './orden/orden.component';
import { ViewOrdersComponent } from './view-orders/view-orders.component';
import { UsersComponent, DialogNewUser, DialogEditUser } from './users/users.component';
import { CategoriesComponent, DialogNewCategory, DialogEditCategory } from './categories/categories.component';
import { CampusComponent, DialogNewCampus, DialogEditCampus } from './campus/campus.component';
import { AreasComponent, DialogNewArea, DialogEditArea } from './areas/areas.component';
import { ProvidersComponent, DialogNewProvider, DialogEditProvider, DialogNewProduct, DialogEditProduct } from './providers/providers.component';
import { MatSlideToggleModule} from '@angular/material/slide-toggle';

import { WarehouseComponent } from './warehouse/warehouse.component';
import { MatTabsModule} from '@angular/material/tabs';
import { MobilityComponent, DialogNewItemMobility, DialogConfirmMobility, DialogEditItemMobility} from './mobility/mobility.component';

import { AnalyticsComponent } from './analytics/analytics.component';
import { MatProgressBarModule} from '@angular/material/progress-bar';

import { DailyComponent, DialogConfirmDaily } from './daily/daily.component';



@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        NuevoComponent,
        OrdenComponent,
        WarehouseComponent,
        InicioComponent,
        HistoryComponent,
        GenerarActaComponent,
        BirthdayComponent,
        ViewOrdersComponent,
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
        DialogHistoryDetail,
        DialogLudops,
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
        MobilityComponent,
        DialogNewItemMobility,
        DialogEditItemMobility,
        DialogConfirmMobility,
        AnalyticsComponent,
        DailyComponent,
        DialogConfirmDaily,

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
        ToastrModule.forRoot(), // ToastrModule added
    ],
    providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy },
      { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, CookieService],
    bootstrap: [AppComponent]
})
export class AppModule { }
