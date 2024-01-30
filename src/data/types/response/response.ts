import IError from "../error/error";


interface IResponse<T> {
    status: boolean;
    data?: T
    error?: IError[]
}
  
export default IResponse;