import * as React from 'react';
import styled from 'styled-components/macro';
import { Logo } from './Logo';
import { StyleConstants } from 'styles/StyleConstants';
import { Nav } from './Nav';
import { PageWrapper } from '../PageWrapper';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'app/providers/authProvider';
import Button from '@mui/material/Button';
import { Avatar, Stack } from '@mui/material';
import { deepOrange } from '@mui/material/colors';

export function NavBar() {
  const auth = useAuth();
  const navigate = useNavigate();

  return (
    <Wrapper>
      <PageWrapper>
        <Logo />
        <Nav />
        <Stack direction="row" spacing={2}>
          <Avatar sx={{ bgcolor: deepOrange[500] }}>
            {(auth.user.username ?? '').slice(0, 1)}님
          </Avatar>
          <Button
            onClick={() =>
              auth.logout(() => {
                navigate('/login');
              })
            }
          >
            로그아웃
          </Button>
        </Stack>
      </PageWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.header`
  box-shadow: 0 1px 0 0 ${p => p.theme.borderLight};
  height: ${StyleConstants.NAV_BAR_HEIGHT};
  display: flex;
  position: fixed;
  top: 0;
  width: 100%;
  background-color: ${p => p.theme.background};
  z-index: 2;

  @supports (backdrop-filter: blur(10px)) {
    backdrop-filter: blur(10px);
    background-color: ${p =>
      p.theme.background.replace(
        /rgba?(\(\s*\d+\s*,\s*\d+\s*,\s*\d+)(?:\s*,.+?)?\)/,
        'rgba$1,0.75)',
      )};
  }

  ${PageWrapper} {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;
