import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { Route, BrowserRouter } from 'react-router-dom';
import { GlobalStyle } from '../styles/global-styles';
import { LoginPage } from './pages/LoginPage/Loadable';
import { useTranslation } from 'react-i18next';
import { RecoilRoot } from 'recoil';
import { Routes } from 'react-router';
import { AuthProvider, RequireAuth, useAuth } from './providers/authProvider';
import { ThemeProvider } from 'styles/theme/ThemeProvider';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  const { i18n } = useTranslation();

  return (
    <RecoilRoot>
      <React.Suspense fallback={<div>Loading...</div>}>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <Helmet
                titleTemplate="%s - 블로그"
                defaultTitle="블로그"
                htmlAttributes={{ lang: i18n.language }}
              >
                <meta name="description" content="블로그" />
              </Helmet>

              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route element={<NotFoundPage />} />
              </Routes>
              <GlobalStyle />
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </React.Suspense>
    </RecoilRoot>
  );
}
