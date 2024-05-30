export class ReqValidation {
    constructor(
    public user_id: number,
    public req_id: number,
    public date: string,
    public hour: string,
    public state: string,

    public first_name?: string,
    public paternal_name?: string,
    public id?: number,
    ){};
}