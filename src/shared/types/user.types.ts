export interface IUser {
  userId: number;
  [key: string]: number | string | object | boolean | undefined;
}
