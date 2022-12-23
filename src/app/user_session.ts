
export class UserSession {
  constructor(
    public user_id: string,
    public created: string,
    public expires: string,
    public id?: number,
  ) { }

}
