import axios, { AxiosInstance } from 'axios';

axios.defaults.baseURL = 'http://host.docker.internal:3000/';

type Optional<T> = T | null;

/**
 * @help https://axios-http.com/kr/docs/config_defaults
 */
export namespace AxiosManager {
  let axiosInstance: Optional<AxiosInstance> = null;
  let isReady: boolean = false;

  export function setBaseUrl(baseURL: string) {
    axios.defaults.baseURL = baseURL;
  }

  export function createAxiosInstance({ AUTH_TOKEN }: { AUTH_TOKEN: string }) {
    if (!axiosInstance) {
      axiosInstance = axios.create({
        headers: {
          'Content-Type': 'application/json',
        },
      });

      axiosInstance.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${AUTH_TOKEN}`;
      isReady = true;
    }

    return axiosInstance;
  }

  export function setAccessToken({ token }: { token: string }) {
    if (axiosInstance) {
      axiosInstance.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${token}`;
    }
  }

  export function removeAxiossInstance() {
    axiosInstance = null;
    isReady = false;
  }

  export function getAxiosInstance(): Optional<AxiosInstance> {
    return axiosInstance;
  }
}
