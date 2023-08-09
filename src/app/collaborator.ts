
export class Collaborator {
  constructor(
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
  ) { }

}
