const API_URL = 'http://host.docker.internal:3000';

export function request<T = unknown>(
  url: string,
  payload: Record<string, any>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(json => resolve(json))
      .catch(err => reject(err));
  });
}

export const auth = {
  logout: (url: string, token: string) => {
    return new Promise((resolve, reject) => {
      fetch(`${API_URL}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(json => resolve(json))
        .catch(err => reject(err));
    });
  },
};

/**
 * @deprecated
 */
export function get<T = Record<string, any>>(
  url: string,
  token: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(json => resolve(json))
      .catch(err => reject(err));
  });
}

/**
 * 사용자 정보를 가져옵니다
 *
 * @param url
 * @param token
 * @returns
 */
export function getUser<T = Record<string, any>>(
  url: string,
  token: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}${url}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(json => resolve(json))
      .catch(err => reject(err));
  });
}
