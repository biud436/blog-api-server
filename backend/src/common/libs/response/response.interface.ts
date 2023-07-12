export interface IResponse {
    message: string;
    statusCode: number;
    error?: string;
}

export interface IResponsableData {
    name?: string;
    result: string;
    statusCode: number;
    message: string;
    data: any;
}
