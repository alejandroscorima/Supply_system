
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { NuevoComponent } from './nuevo/nuevo.component';
import { LoginComponent } from './login/login.component';
import { FondoComponent } from './fondo/fondo.component';
import { OrdenComponent } from './orden/orden.component';
import { UsersComponent } from './users/users.component';
import { CategoriesComponent } from './categories/categories.component';
import { CampusComponent } from './campus/campus.component';
import { AreasComponent } from './areas/areas.component';
import { ProvidersComponent } from './providers/providers.component';
import { WarehouseComponent } from './warehouse/warehouse.component';
import { MobilityComponent } from './mobility/mobility.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { DailyComponent } from './daily/daily.component';
import { ActivitiesComponent } from './activities/activities.component';

const routes: Routes = [
  { path: "", component: InicioComponent },
  { path: "login", component: LoginComponent  },
  { path: "new", component: NuevoComponent  },
  { path: "orden", component: OrdenComponent  },
  { path: "warehouse", component: WarehouseComponent  },
  { path: "fondo", component: FondoComponent  },
  { path: "users", component: UsersComponent  },
  { path: "categories", component: CategoriesComponent  },
  { path: "campus", component: CampusComponent  },
  { path: "areas", component: AreasComponent  },
  { path: "providers", component: ProvidersComponent  },
  { path: "mobility", component: MobilityComponent},
  { path: "analytics", component: AnalyticsComponent},
  { path: "daily", component: DailyComponent},
  { path: "activities", component: ActivitiesComponent},

  //{ path: "", redirectTo: "/clientes", pathMatch: "full" },// Cuando es la raíz
  //{ path: "**", redirectTo: "/clientes" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
