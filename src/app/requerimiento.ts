import { Item } from "./item";

export class Requerimiento {
  constructor(
    public codigo: string,
    public fecha: string,
    public area: string,
    public encargado: string,
    public sala: string,
    public prioridad: string,
    public motivo: string,
    public items: Item[],
    public id_asignado: number,
    public estado: string,
    public user_id:number,
    public validation?: string,
    public total_budget?: string,
    public campus_id?: number,
    public validation_id?: number,
    public id?: number,
  ) { }
}
