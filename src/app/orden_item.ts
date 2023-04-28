
export class OrdenItem {
  constructor(
    public ord_codigo: string,
    public cantidad: number,
    public descripcion: string,
    public unit_price: string,
    public unit_price_aux: string,
    public subtotal: string,
    public estado:string,
    public igv_toggle:boolean,
    public igv_unit: string,
    public igv_unit_aux: string,
    public units: string,
    public igv_enabled: boolean,
    public id?: number,
  ) { }
}
