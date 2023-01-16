
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { HistoryComponent } from './history/history.component';
import { NuevoComponent } from './nuevo/nuevo.component';
import { BirthdayComponent } from './birthday/birthday.component';
import { LoginComponent } from './login/login.component';
import { FondoComponent } from './fondo/fondo.component';
import { OrdenComponent } from './orden/orden.component';
import { ViewOrdersComponent } from './view-orders/view-orders.component';
import { UsersComponent } from './users/users.component';
import { CategoriesComponent } from './categories/categories.component';
import { CampusComponent } from './campus/campus.component';
import { AreasComponent } from './areas/areas.component';
import { ProvidersComponent } from './providers/providers.component';
import { WarehouseComponent } from './warehouse/warehouse.component';
import { MobilityComponent } from './mobility/mobility.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { DailyComponent } from './daily/daily.component';

const routes: Routes = [
  { path: "", component: InicioComponent },
  { path: "login", component: LoginComponent  },
  { path: "new", component: NuevoComponent  },
  { path: "orden", component: OrdenComponent  },
  { path: "warehouse", component: WarehouseComponent  },
  { path: "view-orders", component: ViewOrdersComponent  },
  { path: "fondo", component: FondoComponent  },
  { path: "users", component: UsersComponent  },
  { path: "categories", component: CategoriesComponent  },
  { path: "campus", component: CampusComponent  },
  { path: "areas", component: AreasComponent  },
  { path: "providers", component: ProvidersComponent  },
  { path: "history", component: HistoryComponent },
  { path: "hb", component: BirthdayComponent },
  { path: "mobility", component: MobilityComponent},
  { path: "analytics", component: AnalyticsComponent},
  { path: "daily", component: DailyComponent},

  //{ path: "", redirectTo: "/clientes", pathMatch: "full" },// Cuando es la raíz
  //{ path: "**", redirectTo: "/clientes" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
