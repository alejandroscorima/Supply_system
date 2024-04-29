export class Folder {
  constructor(
    public name: string,
    public description: string,
    public isShared: boolean,
    public folder_parent_id: number,
    public user_id: number,

    public id?: number
  ) {}
}
