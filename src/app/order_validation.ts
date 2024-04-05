export class OrdersValidation {
    constructor(
    public user_id: string,
    public order_id: string,
    public date: string,
    public hour: string,
    public state: string,
    public id?: number,
    ){};
}