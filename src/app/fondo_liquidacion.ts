
export class FondoLiquidacion {
  constructor(
    public fecha: string,
    public campus: string,
    public campus_dir: string,
    public numero: string,
    public importe: string,
    public personal: string,
    public empresa: string,
    public user_id: number,
    public estado: string,
    public id?: number,
  ) { }
}
