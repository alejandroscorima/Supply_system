
export class OrdenItem {
  constructor(
    public ord_codigo: string,
    public cantidad: number,
    public descripcion: string,
    public unit_price: string,
    public unit_price_aux: string,
    public subtotal: string,
    public estado:string,
    public id?: number,
  ) { }
}
