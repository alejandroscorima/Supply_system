export class OrdersValidation {
    constructor(
    public user_id: number,
    public order_id: number,
    public date: string,
    public hour: string,
    public state: string,
    public id?: number,
    ){};
}