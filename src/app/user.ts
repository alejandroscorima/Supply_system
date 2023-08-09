
export class User {
  constructor(
    public colab_id: number,
    public type_doc: string,
    public doc_number: string,
    public first_name: string,
    public paternal_surname: string,
    public maternal_surname: string,
    public gender: string,
    public birth_date: string,
    public civil_status: string,
    public profession: string,
    public cel_number: string,
    public address: string,
    public district: string,
    public province: string,
    public region: string,
    public username: string,
    public password: string,
    public supply_role: string,
    public supply_role_id: number,
    public latitud: string,
    public longitud: string,
    public photo_url: string,
    public user_id?: number,
  ) { }

}
