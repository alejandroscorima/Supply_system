
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
    public id?: number,
  ) { }
}
