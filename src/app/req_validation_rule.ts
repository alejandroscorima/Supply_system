export class ReqValidationRule {
    constructor(
    public user_id: number,
    public campus_id: number,
    public amount: string,
    public id?: number,
    ){};
}