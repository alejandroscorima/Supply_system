export class Collaborator {
  selected: any;

  constructor(
    //Si es ----
    public user_id: number,
    public area_id: number,
    public area: string,
    public campus_id: number,
    public campus: string,
    public position: string,
    public raz_social: string,
    public situation: string,
    public service_unit: string,
    public type_area: string,
    public admission_date: string,
    public cessation_date: string,
    public colab_code: string,
    public colab_id?: number,
    //No es --------
    public type_doc?: string,
    public doc_number?: string,
    public first_name?: string,
    public paternal_surname?: string,
    public maternal_surname?: string,
    public gender?: string,
    public birth_date?: string,
    public civil_status?: string,
    public profession?: string,
    public cel_number?: string,
    public address?: string,
    public district?: string,
    public province?: string,
    public region?: string,
    public username?: string,
    public password?: string,
    public supply_role?: string,
    public latitud?: string,
    public longitud?: string,
    public photo_url?: string
  ) {}
}
