
export class Product {
  constructor(
    public codigo: string,
    public descripcion: string,
    public val_sis: string,
    public um_sist: string,
    public val_prov: string,
    public um_prov: string,
    public id?: number,
  ) { }

}
