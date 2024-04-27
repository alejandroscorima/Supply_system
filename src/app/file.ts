export class Filep {
  
  constructor(
  
    public name: string,
    public url: string,
    public description: string,
    public extension: string,
    public date: string,
    public hour: string,
    public order_id: number,
    public folder_id?: number,
    public id?: number,
  ) {}
}
