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
    public id?: number,
  ) { }
}
