
export class Proveedor {
  constructor(
    public ruc: string,
    public razon_social: string,
    public direccion: string,
    public cci: string,
    public estado: string,
    public categoria: string,
    public id?: number,
  ) { }

}
