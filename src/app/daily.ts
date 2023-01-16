
export class Daily {
  constructor(
    public fecha: string,
    public h_inicio: string,
    public h_fin: string,
    public descripcion: string,
    public user_id: number,
    public id?: number,
  ) { }
}
