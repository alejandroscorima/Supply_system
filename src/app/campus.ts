
export class Campus {
  constructor(
    public name: string,
    public address: string,
    public company: string,
    public ruc: string,
    public supply_ord_suffix: string,
    public supply_req_suffix: string,
    public is_operative?: string,
    public campus_id?: number,
  ) { }

}
