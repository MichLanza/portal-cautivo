import axios from "axios";
import { OmadaHotspotLoginResponse } from "../entities/OmadaHotspotLoginResponse";
import { LoginResponse } from "../entities/LoginResponse";

export class OmadaHotspotApi {
  private baseUrl: string;
  private controllerId: string;

  constructor(baseUrl: string, controllerId: string) {
    this.baseUrl = baseUrl;
    this.controllerId = controllerId;
  }

  async loginHotspot(name: string, password: string): Promise<LoginResponse | null> {
    const url = `${this.baseUrl}/${this.controllerId}/api/v2/hotspot/login`;
    
    const data = { name, password };
    try {
      const response = await axios.post<OmadaHotspotLoginResponse>(url, data, {
        headers: { "Content-Type": "application/json" }
      });
      const setCookie = response.headers['set-cookie'];
      let sessionId: string | null = null;
      if (setCookie) {
        const match = setCookie.join('; ').match(/TPOMADA_SESSIONID=([^;]+)/);
        if (match) {
          sessionId = match[1];
          console.log("TPOMADA_SESSIONID:", sessionId);
        }
      }
      if (response.data.errorCode === 0) {
        if (response.data.result && response.data.result.token) {
          return {token : response.data.result.token , cookie : sessionId || ''};
        } else {
          console.error("Login succeeded but result or token is undefined.");
          return null;
        }
      } else {
        console.error("Login error:", response.data.msg);
        return null;
      }
    } catch (error) {
      console.error("Request failed:", error);
      return null;
    }
  }

 async authorizeClient(
    token: string,
    clientMac: string,
    apMac: string,
    ssidName: string,
    radioId: string,
    target : string,
    microseconds: number,
    cookie : string
  ): Promise<boolean> {
    const url = `${this.baseUrl}/${this.controllerId}/api/v2/hotspot/extPortal/auth`;

    const postData = {
      clientMac,
      apMac,
      ssidName,
      radioId,
      site: target,
      authType: 4,
      time: microseconds,
    };

    try {
      
      const response = await axios.post(url, postData, {
        headers: {
          "Content-Type": "application/json",
          "Csrf-Token": token,
          "Cookie" : `TPOMADA_SESSIONID=${cookie}`
        },
        //  withCredentials: true,
      });
      // console.log(response.data);

      const data = response.data as { errorCode: number; [key: string]: any };
      console.log(data);

      if (data.errorCode === 0) {
        return true;
      } else {
        console.error("Error de autorización:", data);
        return false;
      }
    } catch (error) {
      console.error("Fallo en la petición de autorización:", error);
      return false;
    }
  }
}


