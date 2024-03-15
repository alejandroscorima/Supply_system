
export class FondoItem {
  constructor(
    public campus: string,
    public fecha: string,
    public tipo_doc: string,
    public serie: string,
    public numero: string,
    public ruc: string,
    public raz_social: string,
    public monto: string,
    public categoria: string,
    public estado: string,
    public liquidacion_id: number,
    public user_id: number,
    public orden_id: number,
    public id?: number,
  ) { }
}
