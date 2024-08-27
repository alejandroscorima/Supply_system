import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  baseUrl = environment.baseUrl;
  testUrl = 'https://2a411dcf-3141-4d4e-b1ce-68a5cfef847d-00-24t28a1nkhx80.worf.replit.dev/';
  constructor(private http: HttpClient) { }

  getRequirements(status: string, sede: string, start_date: string, end_date: string, area: string): Observable<any> {
    let params = new HttpParams()
      .set('status', status)
      .set('sede', sede)
      .set('start_date', start_date)
      .set('end_date', end_date)
      .set('area', area);

    return this.http.get(this.baseUrl+'/getReqsByDate.php', { params });
  }

  getAnalyticsOrders(sede: string, area: string, startDate: string, endDate: string): Observable<any> {
    let params = new HttpParams();

    // Añadir parámetros a la solicitud, por defecto 'TODOS'
    params = params.set('sede', sede || 'TODOS');
    params = params.set('area', area || 'TODOS');
    
    // Si las fechas están definidas, las agregamos
    if (startDate) {
      params = params.set('start_date', startDate);
    }
    if (endDate) {
      params = params.set('end_date', endDate);
    }

    // Realizamos la solicitud GET con los parámetros
    return this.http.get(this.baseUrl+'/getAnalyticsOrders.php', { params });
  }

  getAnalyticsFondoItems(campus: string, categoria: string, estado:string, startDate: string, endDate: string): Observable<any> {
    let params = new HttpParams();

    // Añadir parámetros a la solicitud, por defecto 'TODOS'
    params = params.set('sede', campus || 'TODOS');
    params = params.set('categoria', categoria || 'TODOS');
    params = params.set('estado', estado || 'TODOS');
    
    // Si las fechas están definidas, las agregamos
    if (startDate) {
      params = params.set('start_date', startDate);
    }
    if (endDate) {
      params = params.set('end_date', endDate);
    }

    // Realizamos la solicitud GET con los parámetros
    return this.http.get(this.baseUrl+'/getAnalyticsFondoItems.php', { params });
  }

  getAnalyticsEntregaItems(campus: string, categoria: string, estado:string, startDate: string, endDate: string): Observable<any> {
    let params = new HttpParams();

    // Añadir parámetros a la solicitud, por defecto 'TODOS'
    params = params.set('sede', campus || 'TODOS');
    params = params.set('categoria', categoria || 'TODOS');
    params = params.set('estado', estado || 'TODOS');
    
    // Si las fechas están definidas, las agregamos
    if (startDate) {
      params = params.set('start_date', startDate);
    }
    if (endDate) {
      params = params.set('end_date', endDate);
    }

    // Realizamos la solicitud GET con los parámetros
    return this.http.get(this.baseUrl+'/getAnalyticsEntregaItems.php', { params });
  }
  getnalyticsMobility(campus: string, estado: string, startDate: string, endDate: string): Observable<any> {
    let params = new HttpParams();

    // Añadir parámetros a la solicitud, por defecto 'TODOS'
    params = params.set('sede', campus || 'TODOS');
    params = params.set('estado', estado || 'TODOS');
    
    // Si las fechas están definidas, las agregamos
    if (startDate) {
      params = params.set('start_date', startDate);
    }
    if (endDate) {
      params = params.set('end_date', endDate);
    }

    // Realizamos la solicitud GET con los parámetros
    return this.http.get(this.baseUrl+ '/getAnalyticsMobility.php', { params });
  }
}

