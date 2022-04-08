export interface IChecksum {
  data?: { [key: string]: string | number };
  params?: { [key: string]: string };
  secret: string;
}

export interface IBuildChecksum {
  checksum: string;
  random: string;
  time: number;
}

export interface IGetRequest {
  walletSecret: string;
  walletCode: string;
  url: string;
}

export interface IPostRequest extends IGetRequest {
  data: any;
}
