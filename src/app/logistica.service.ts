
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from "./user";
import { environment } from "../environments/environment";
import { Observable } from 'rxjs';
import { Requerimiento } from './requerimiento';
import { Item } from './item';
import { Orden } from './orden';
import { OrdenItem } from './orden_item';
import { FondoItem } from './fondo_item';
import { FondoLiquidacion } from './fondo_liquidacion';
import { Proveedor } from './proveedor';
import { Product } from './product';
import { Daily } from './daily';
import { Mobility } from './mobility';
import { Activity } from './activity';
import { Campus } from './campus';
import { Doc } from './doc';
import { EntregaLiquidacion } from './entrega_liquidacion';
import { EntregaItem } from './entrega_item';
import { OrdersValidation } from './order_validation';

@Injectable({
  providedIn: 'root'
})
export class LogisticaService {
  baseUrl = environment.baseUrl
  respuesta;
  urlconsulta;

  constructor(private http: HttpClient) { }

  addReq(req: Requerimiento) {
    return this.http.post(`${this.baseUrl}/postRequerimiento.php`, req);
  }

  addActivity(ac: Activity) {
    return this.http.post(`${this.baseUrl}/postActivity.php`, ac);
  }

  addProvider(prov: Proveedor) {
    return this.http.post(`${this.baseUrl}/postProvider.php`, prov);
  }

  addProduct(prod: Product) {
    return this.http.post(`${this.baseUrl}/postProduct.php`, prod);
  }

  addOrd(ord: Orden) {
    //return this.http.post(`${this.baseUrl}/postOrden.php`, ord);
    return this.http.post(`${this.baseUrl}/postOrdenNew.php`, ord);
  }

  getOrdersValidations(order_id:number){
    return this.http.get(`${this.baseUrl}/getOrdersValidations.php?order_id=${order_id}`);
  }

  getOrderValidationRules(campus_id:number){
    return this.http.get(`${this.baseUrl}/getOrderValidationRules.php?campus_id=${campus_id}`);
  }

  addOrderValidation(ordVal: OrdersValidation) {
    return this.http.post(`${this.baseUrl}/postOrdersValidations.php`, ordVal);
  }

  updateOrderValidation(ordVal: OrdersValidation) {
    return this.http.put(`${this.baseUrl}/updateOrdersValidations.php`, ordVal);
  }


  addDoc(doc: Doc) {
    return this.http.post(`${this.baseUrl}/postDoc.php`, doc);
  }

  getDocsByOrdenId(orden_id: number) {
    return this.http.get(`${this.baseUrl}/getDocsByOrdenId.php?orden_id=${orden_id}`);
  }

  addFondoItem(it: FondoItem) {
    return this.http.post(`${this.baseUrl}/postFondoItem.php`, it);
  }
 
  addEntregaItem(it: EntregaItem) {
    return this.http.post(`${this.baseUrl}/postEntregaItem.php`, it);
  }
  addFondoLiquidacion(liq: FondoLiquidacion) {
    return this.http.post(`${this.baseUrl}/postFondoLiquidacion.php`, liq);
  }
  addEntregaLiquidacion(liq: EntregaLiquidacion) {
    return this.http.post(`${this.baseUrl}/postEntregaLiquidacion.php`, liq);
  }

  addDaily(daily: Daily){
    return this.http.post(`${this.baseUrl}/postDaily.php`, daily);
  }

  addMobility(mobility: Mobility){
    return this.http.post(`${this.baseUrl}/postMobility.php`, mobility)
  }

  updateReq(req: Requerimiento) {
    return this.http.put(`${this.baseUrl}/updateRequerimiento.php`, req);
  }

  updateOrd(ord: Orden) {
    return this.http.put(`${this.baseUrl}/updateOrden.php`, ord);
  }


//get functions:

  getSignatureByUserId(user_id: number){
    return  this.http.get(`${this.baseUrl}/getSignatureByUserId.php?user_id=${user_id}`);
  }

  getDaily(){
    return this.http.get(`${this.baseUrl}/getDaily.php`);
  }

  getMobility(campus: String){
    return this.http.get(`${this.baseUrl}/getMobility.php?campus=${campus}`);
  }

  getAreaById(area_id: number) {
    return this.http.get(`${this.baseUrl}/getAreaById.php?area_id=${area_id}`);
  }

  
  getActivityById(id: number) {
    return this.http.get(`${this.baseUrl}/getActivityById.php?id=${id}`);
  }
  getAllAreas() {
    return this.http.get(`${this.baseUrl}/getAllAreas.php`);
  }

  getCampusById(campus_id: number) {
    return this.http.get(`${this.baseUrl}/getCampusById.php?campus_id=${campus_id}`);
  }

  getAllCampus() {
    return this.http.get(`${this.baseUrl}/getAllCampus.php`);
  }

  getCampusBySupervisorId(sup_id: number) {
    return this.http.get(`${this.baseUrl}/getCampusBySupervisorId.php?sup_id=${sup_id}`);
  }

  getActiveProviders() {
    return this.http.get(`${this.baseUrl}/getActiveProviders.php`);
  }

  getAllProviders() {
    return this.http.get(`${this.baseUrl}/getAllProviders.php`);
  }

  getAllProducts(ruc) {
    return this.http.get(`${this.baseUrl}/getAllProducts.php?ruc=${ruc}`);
  }

  getAllOficinaOrders(user_id, user_role, destino) {
    //return this.http.get(`${this.baseUrl}/getAllOficinaOrdersNew.php?user_id=${user_id}&user_role=${user_role}&destino=${destino}`);
    return this.http.get(`${this.baseUrl}/getAllOficinaOrdersNewSupervisor.php?user_id=${user_id}&user_role=${user_role}&destino=${destino}`);   
  }
  getOrdersByStepStatus(user_id, user_role, destino, status) {
    //return this.http.get(`${this.baseUrl}/getAllOficinaOrdersNew.php?user_id=${user_id}&user_role=${user_role}&destino=${destino}`);
    return this.http.get(`${this.baseUrl}/getOrdersByStepStatus.php?user_id=${user_id}&user_role=${user_role}&destino=${destino}`);   
  } 
  
  getAllWarehouseOrders() {
    return this.http.get(`${this.baseUrl}/getAllWarehouseOrders.php`);
  }

  getAllCategories() {
    return this.http.get(`${this.baseUrl}/getAllCategories.php`);
  }

  getActivities(estado: string) {
    return this.http.get(`${this.baseUrl}/getActivities.php?estado=${estado}`);
  }

  getPrioridad() {
    return this.http.get(`${this.baseUrl}/getPrioridad.php`);
  }

  addReqDet(item: Item) {
    return this.http.post(`${this.baseUrl}/postReqDetalle.php`, item);
  }

  addOrdDet(ordItem: OrdenItem) {
    return this.http.post(`${this.baseUrl}/postOrdDetalle.php`, ordItem);
  }

  updateOrdDet(ordItem: OrdenItem) {
    return this.http.put(`${this.baseUrl}/updateOrdDetalle.php`, ordItem);
  }

  updateReqDet(item: Item) {
    return this.http.put(`${this.baseUrl}/updateReqDetalle.php`, item);
  }

/*   getReqsPendientes(tipo_usuario: string, id_asignado:string, user_id:number) {
    return this.http.get(`${this.baseUrl}/getReqsPendientes.php?tipo_usuario=${tipo_usuario}&id_asignado=${id_asignado}&user_id=${user_id}`);
  }

  getReqsProceso(tipo_usuario: string, id_asignado:string, user_id:number) {
    return this.http.get(`${this.baseUrl}/getReqsProceso.php?tipo_usuario=${tipo_usuario}&id_asignado=${id_asignado}&user_id=${user_id}`);
  }

  getReqsFin(tipo_usuario: string, id_asignado:string, user_id:number) {
    return this.http.get(`${this.baseUrl}/getReqsFin.php?tipo_usuario=${tipo_usuario}&id_asignado=${id_asignado}&user_id=${user_id}`);
  } */

  getReqsPendientesNew(tipo_usuario: string, id_asignado:string, user_id:number, salas:string[]) {
    return this.http.get(`${this.baseUrl}/getReqsPendientesNew.php?tipo_usuario=${tipo_usuario}&id_asignado=${id_asignado}&user_id=${user_id}&salas=${salas}`);
  }

  getReqsProcesoNew(tipo_usuario: string, id_asignado:string, user_id:number, salas:string[]) {
    return this.http.get(`${this.baseUrl}/getReqsProcesoNew.php?tipo_usuario=${tipo_usuario}&id_asignado=${id_asignado}&user_id=${user_id}&salas=${salas}`);
  }

  getReqsFinNew(tipo_usuario: string, id_asignado:string, user_id:number, salas:string[]) {
    return this.http.get(`${this.baseUrl}/getReqsFinNew.php?tipo_usuario=${tipo_usuario}&id_asignado=${id_asignado}&user_id=${user_id}&salas=${salas}`);
  }

  getSalaByName(campus_name: string) {
    return this.http.get(`${this.baseUrl}/getSalaByName.php?campus_name=${campus_name}`);
  }

  getProveedorByRuc(ruc: string) {
    return this.http.get(`${this.baseUrl}/getProveedorByRuc.php?ruc=${ruc}`);
  }

  getProveedorByRazSoc(razSoc: string) {
    return this.http.get(`${this.baseUrl}/getProveedorByRazSoc.php?razSoc=${razSoc}`);
  }

  getLastReqCode(dateStr: string) {
    return this.http.get(`${this.baseUrl}/getLastReqCode.php?dateStr=${dateStr}`);
  }

  getLastOrdOficinaCode(num: string,destino:string, empresa: string) {
    return this.http.get(`${this.baseUrl}/getLastOrdOficinaCode.php?num=${num}&destino=${destino}&empresa=${empresa}`);
  }

  getLastOrdWarehouseCode(num: string,destino:string, empresa: string) {
    return this.http.get(`${this.baseUrl}/getLastOrdWarehouseCode.php?num=${num}&destino=${destino}&empresa=${empresa}`);
  }

  getLastMobCode(num: string, campus:string) {
    return this.http.get(`${this.baseUrl}/getLastMobCode.php?num=${num}&campus=${campus}`);
  }

  getLastFondoLiquidacionNum(num: string,campus:string, empresa: string) {
    return this.http.get(`${this.baseUrl}/getLastFondoLiquidacionNum.php?num=${num}&campus=${campus}&empresa=${empresa}`);
  }
  getLastEntregaLiquidacionNum(num: string,campus:string, empresa: string) {
    return this.http.get(`${this.baseUrl}/getLastEntregaLiquidacionNum.php?num=${num}&campus=${campus}&empresa=${empresa}`);
  }
  getLastFondoLiquidacionId() {
    return this.http.get(`${this.baseUrl}/getLastFondoLiquidacionId.php?`);
  }

  getReqDetailsResumeByUser() {
    return this.http.get(`${this.baseUrl}/getReqDetailsResumeByUser.php`);
  }

  getReqDetailsPendByCode(codigo: string, id_asignado: string) {
    return this.http.get(`${this.baseUrl}/getReqDetailsPendByCode.php?codigo=${codigo}&id_asignado=${id_asignado}`);
  }

  getReqDetailsByCode(codigo: string) {
    return this.http.get(`${this.baseUrl}/getReqDetailsByCode.php?codigo=${codigo}`);
  }

  getReqDetailsAprobByCode(codigo: string, id_asignado: string) {
    return this.http.get(`${this.baseUrl}/getReqDetailsAprobByCode.php?codigo=${codigo}&id_asignado=${id_asignado}`);
  }

  getReqDetailsAsignadoByCode(codigo: string) {
    return this.http.get(`${this.baseUrl}/getReqDetailsAsignadoByCode.php?codigo=${codigo}`);
  }

  getReqDetailsAtendidoByCode(codigo: string) {
    return this.http.get(`${this.baseUrl}/getReqDetailsAtendidoByCode.php?codigo=${codigo}`);
  }

  getReqDetailsCompradoByCode(codigo: string) {
    return this.http.get(`${this.baseUrl}/getReqDetailsCompradoByCode.php?codigo=${codigo}`);
  }

  getReqDetailsEntregadoByCode(codigo: string) {
    return this.http.get(`${this.baseUrl}/getReqDetailsEntregadoByCode.php?codigo=${codigo}`);
  }

  getFondoItemsResumeByCategory() {
    return this.http.get(`${this.baseUrl}/getFondoItemsResumeByCategory.php`);
  }

  getFondoItems(sala: string, estado: string, user_id: number) {
    return this.http.get(`${this.baseUrl}/getFondoItems.php?sala=${sala}&estado=${estado}&user_id=${user_id}`);
  }
  getEntregaItems(sala: string, estado: string, user_id: number) {
    return this.http.get(`${this.baseUrl}/getEntregaItems.php?sala=${sala}&estado=${estado}&user_id=${user_id}`);
  }

  getFondoItemsByLiquidacionId(liq_id: string) {
    return this.http.get(`${this.baseUrl}/getFondoItemsByLiquidacionId.php?liq_id=${liq_id}`);
  }
  getEntregaItemsByLiquidacionId(liq_id: string) {
    return this.http.get(`${this.baseUrl}/getEntregaItemsByLiquidacionId.php?liq_id=${liq_id}`);
  }

  getFondoItemsByOrdenId(orden_id: string) {
    return this.http.get(`${this.baseUrl}/getFondoItemsByOrdenId.php?orden_id=${orden_id}`);
  }

  getOrdenItemsByOrdenId(ord_id: string) {
    return this.http.get(`${this.baseUrl}/getOrdenItemsByOrdenId.php?ord_id=${ord_id}`);
  }

  getFondoLiquidacionesByCampus(campus: string) {
    return this.http.get(`${this.baseUrl}/getFondoLiquidacionesByCampus.php?campus=${campus}`);
  }

  getEntregaLiquidacionesByCampus(campus: string) {
    return this.http.get(`${this.baseUrl}/getEntregaLiquidacionesByCampus.php?campus=${campus}`);
  }

  updateProvider(prov: Proveedor) {
    return this.http.put(`${this.baseUrl}/updateProvider.php`, prov);
  }

  updateActivity(act: Activity) {
    return this.http.put(`${this.baseUrl}/updateActivity.php`, act);
  }

  updateProduct(prod: Product) {
    return this.http.put(`${this.baseUrl}/updateProduct.php`, prod);
  }

  updateFondoItem(item: FondoItem) {
    return this.http.put(`${this.baseUrl}/updateFondoItem.php`, item);
  }
  updateEntregaItem(item: FondoItem) {
    return this.http.put(`${this.baseUrl}/updateEntregaItem.php`, item);
  }

  updateFondoLiquidacion(liq: FondoLiquidacion) {
    return this.http.put(`${this.baseUrl}/updateFondoLiquidacion.php`, liq);
  } 
  updateEntregaLiquidacion(liq: EntregaLiquidacion) {
    return this.http.put(`${this.baseUrl}/updateEntregaLiquidacion.php`, liq);
  } 

  deleteFondoItem(item_id) {
    return this.http.delete(`${this.baseUrl}/deleteFondoItem.php?item_id=${item_id}`);
  }
  deleteEntregaItem(item_id) {
    return this.http.delete(`${this.baseUrl}/deleteEntregaItem.php?item_id=${item_id}`);
  }

  deleteActivity(id) {
    return this.http.delete(`${this.baseUrl}/deleteActivity.php?id=${id}`);
  }

  getClientFromReniec(doc_number: string) {

    this.urlconsulta = 'https://my.apidev.pro/api/dni/'+doc_number+'?api_token=e9cc47e67d492cdee675bfb2b365c09393611b5141144aa0da34cab5429bb5e8';
    return this.http.get(this.urlconsulta);
  }

  getConsultaRUC(ruc: string) {

    this.urlconsulta = 'https://my.apidev.pro/api/ruc/'+ruc+'?api_token=e9cc47e67d492cdee675bfb2b365c09393611b5141144aa0da34cab5429bb5e8';
    return this.http.get(this.urlconsulta);
  }


}
