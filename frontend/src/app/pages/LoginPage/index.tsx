import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import { Helmet } from 'react-helmet-async';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import { CardHeader, Switch, Typography } from '@mui/material';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { CookiesProvider, useCookies } from 'react-cookie';
import { request, get } from 'app/api/request';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userState, User, userProfile } from '../../../store/user';
import { AuthProvider, RequireAuth, useAuth } from 'app/providers/authProvider';
import { useLocation, useNavigate } from 'react-router';
import {
  getThemeFromStorage,
  isSystemDark,
  saveTheme,
} from 'styles/theme/utils';

interface State {
  amount: string;
  username: string;
  password: string;
  weight: string;
  weightRange: string;
  showPassword: boolean;
}

/**
 * 홈 아이콘
 * @param props
 * @returns
 */
function HomeIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </SvgIcon>
  );
}

/**
 * 로그인 페이지
 */
export function LoginPage() {
  const [values, setValues] = React.useState<State>({
    amount: '',
    username: '',
    password: '',
    weight: '',
    weightRange: '',
    showPassword: false,
  });
  const [cookies, setCookie, removeCookie] = useCookies(['access_token']);
  const [user, setUser] = useRecoilState(userState);
  const location = useLocation();
  const navigate = useNavigate();

  const auth = useAuth();

  const handleChange =
    (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues({ ...values, [prop]: event.target.value });
    };

  const handleClickShowPassword = () => {
    setValues({
      ...values,
      showPassword: !values.showPassword,
    });
  };

  const login = async (username: string, password: string) => {
    const pathname = location.pathname;

    return await auth.login(username, password, () => {
      navigate('/');
    });
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
  };

  const handleLogin = async (event: any) => {
    event.preventDefault();

    const idValue = values.username;
    const pwValue = values.password;

    return login(idValue, pwValue);
  };

  const isValidUser = () => {
    const id = user.id ?? 0;
    return !id || id === 0;
  };

  React.useEffect(() => {
    const currentUser = user as User;
    if (currentUser && currentUser.username != '') {
      alert('이미 로그인되어있습니다');
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Home Page</title>
        <meta
          name="description"
          content="A React Boilerplate application homepage"
        />
      </Helmet>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        rowSpacing={2}
      >
        {isValidUser() ? (
          <Card variant="elevation" sx={{ maxWidth: 480, maxHeight: 640 }}>
            <CardContent>
              <Grid container justifyContent="center" alignItems="center">
                <HomeIcon fontSize="large" />
              </Grid>
              <Container maxWidth="md">
                <Box
                  component="form"
                  noValidate
                  autoComplete="off"
                  padding={[2, 2, 2, 2]}
                >
                  <Stack>
                    <FormControl sx={{}} variant="outlined">
                      <TextField
                        required
                        id="username-required"
                        placeholder="아이디 입력"
                        margin="normal"
                        label="아이디"
                        value={values.username}
                        onChange={handleChange('username')}
                      />
                    </FormControl>
                  </Stack>
                  <Stack>
                    <FormControl
                      sx={{}}
                      variant="outlined"
                      onKeyDown={event => {
                        if (event.key === 'Enter') {
                          handleLogin(event);
                        }
                      }}
                    >
                      <InputLabel htmlFor="outlined-adornment-password">
                        비밀번호
                      </InputLabel>
                      <OutlinedInput
                        id="outlined-adornment-password"
                        type={values.showPassword ? 'text' : 'password'}
                        value={values.password}
                        onChange={handleChange('password')}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                            >
                              {values.showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="비밀번호"
                      />
                    </FormControl>
                  </Stack>
                </Box>

                <Container maxWidth="md">
                  <Stack spacing={2} direction="row" sx={{ marginBottom: 1 }}>
                    <FormControlLabel
                      label="로그인 상태 유지"
                      control={<Checkbox name="saveId" />}
                    ></FormControlLabel>
                    <Stack spacing={2} direction="column">
                      <Stack>
                        <Link href="#">아이디 찾기</Link>
                        <Link href="#">비밀번호 찾기</Link>
                      </Stack>
                    </Stack>
                  </Stack>

                  <Stack>
                    <Button variant="contained" onClick={handleLogin}>
                      로그인
                    </Button>
                  </Stack>
                  <Stack spacing={2} paddingTop={2}>
                    <Typography variant="body2">
                      사용자 등록을 아직 안하셨나요?
                      <Link sx={{ marginLeft: 1 }} href="#">
                        사용자 등록하기
                      </Link>
                    </Typography>
                  </Stack>
                </Container>
              </Container>
            </CardContent>
          </Card>
        ) : (
          <Profile></Profile>
        )}
      </Grid>
    </>
  );
}

/**
 * 프로필 표시
 * @returns
 */
function Profile() {
  const [user, setUser] = useRecoilState(userState);
  const [cookies, setCookie, removeCookie] = useCookies(['access_token']);
  const auth = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    auth.logout(() => {
      navigate('/login');
    });
  };

  const isValidUser = () => {
    return user.id > 0;
  };

  return (
    <CookiesProvider>
      <Card>
        <Stack sx={{ margin: 1 }}>
          <Typography variant="h6">사용자 정보</Typography>
        </Stack>
        <CardContent>
          {isValidUser() ? (
            Object.keys(user)
              .map(key => {
                return (
                  <Typography variant="h5" component="h2">
                    <Typography component="span" sx={{ color: 'red' }}>
                      {key}{' '}
                    </Typography>
                    : {user[key]}
                  </Typography>
                );
              })
              .concat([
                <Button variant="contained" sx={{ margin: 1 }} onClick={logout}>
                  로그아웃
                </Button>,
              ])
          ) : (
            <Typography variant="h5" component="h2">
              로그인 정보가 없습니다
            </Typography>
          )}
        </CardContent>
      </Card>
    </CookiesProvider>
  );
}
