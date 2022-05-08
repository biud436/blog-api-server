import { get, request, auth, getUser } from 'app/api/request';
import * as React from 'react';
import { useCookies, CookiesProvider } from 'react-cookie';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { userState } from 'store/user';
import { AuthContext, LoginResponse } from './common/types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  let [user, setUser] = useRecoilState(userState);
  const [cookies, setCookie, removeCookie] = useCookies([
    'access_token',
    'username',
  ]);

  const login = async (
    username: string,
    password: string,
    callback: VoidFunction,
  ) => {
    const res = await request<LoginResponse>(`/auth/login`, {
      username,
      password,
    });

    if ([200, 204].includes(res.statusCode)) {
      const { access_token, refresh_token } = res.data;
      setCookie('access_token', access_token, { path: '/' });
      setCookie('username', username, { path: '/' });

      const profile = await get('/users/' + username, access_token);
      setUser(profile.data);
    } else {
      alert(res.message);
    }

    callback();

    return res;
  };

  const logout = async (callback: VoidFunction) => {
    const res = await request<LoginResponse>(`/auth/logout`, {});
    const token = cookies.access_token;
    removeCookie('access_token');
    removeCookie('username');
    setUser({ id: 0, username: '', company: '', email: '', phone: '' });
    await auth.logout(`/auth/logout`, token);

    callback();
  };

  const refreshAuth = async (callback: VoidFunction) => {
    const token = cookies.access_token;
    const username = cookies.username;

    if (token === '') {
      return false;
    }

    const profile = await getUser('/users/' + username, token);
    setUser(profile.data);

    callback();

    return true;
  };

  let value = { user, login, logout, refreshAuth };

  return (
    <CookiesProvider>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </CookiesProvider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}

export function RequireAuth({ children }: { children: JSX.Element }) {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  let [user, setUser] = useRecoilState(userState);
  const [cookies, setCookie, removeCookie] = useCookies([
    'access_token',
    'username',
  ]);

  React.useEffect(() => {
    const storedUserName = cookies.username;
    if (storedUserName) {
      auth.refreshAuth(() => {
        navigate(location.pathname);
      });
    }
  }, [user.username]);

  if (!auth.user || auth.user.id === 0) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
