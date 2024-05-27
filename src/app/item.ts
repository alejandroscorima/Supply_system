
export class Item {
  constructor(
    public req_codigo: string,
    public cantidad: number,
    public descripcion: string,
    public tipo: string,
    public estado: string,
    public image_url: string,
    public image: File,
    public id_asignado: string,
    public name_asignado: string,
    public obs:string,
    public f_inicio:string,
    public h_inicio:string,
    public f_atencion:string,
    public h_atencion:string,
    public f_compra:string,
    public h_compra:string,
    public f_final:string,
    public h_final:string,
    public pdf_url: string,
    public pdf: File,
    public req_id?: number,
    public unit_budget?: string,
    public subtotal_budget?: string,
    public id?: number,
  ) { }
}
