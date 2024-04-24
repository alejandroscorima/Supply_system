export class File {
  constructor(
  
    public name: string,
    public url: string,
    public description: string,
    public extension: string,
    public date: string,
    public hour: string,
    public folder_id: number,
    public id?: number,
  ) {}
}
