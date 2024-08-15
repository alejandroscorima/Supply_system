import { OrdenItem } from "./orden_item";

export class Orden {
  constructor(
    public req_id: number,
    public numero: string,
    public ruc: string,
    public razon_social: string,
    public direccion: string,
    public subtotal: string,
    public igv: string,
    public total: string,
    public rebajado: string,
    public fecha: string,
    public destino: string,
    public tipo: string,
    public ordItems: OrdenItem[],
    public estado: string,
    public empresa: string,
    public moneda: string,
    public area: string,
    public destino_dir: string,
    public tipo_pago:string,
    public num_cuenta:string,
    public retencion: string,
    public retencion_percent: string,
    public percepcion: string,
    public fecha_gen: string,
    public hora_gen: string,
    public user_id: number,
    public igv_percent:string,
    public receipt: string,
    public txt: string,
    public section: string,
    public comprobante: string,
    public descuento?: string,
    public observacion?: string,


    ///Paperless
    public step ?: string,
    public step_id ?: number,
    public folder_id ?: number,

    //validator

    public val_id ?: number,
    public val_user_id ?: number,
    public val_order_id ?: number,
    public val_date ?: string,
    public val_hour ?: string,
    public val_state ?: string,
    
    public isChecked?: boolean ,

    public status?: string,
    
    public id?: number,
    public total_inicial?: string,

    public user_name?: string,
    public step_status?: string,
  ) { 
    isChecked=false;
  }
}
