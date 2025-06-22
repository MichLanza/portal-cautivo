export interface OmadaHotspotLoginResponse {
  errorCode: number;
  msg: string;
  result?: {
    token: string;
  };
}

