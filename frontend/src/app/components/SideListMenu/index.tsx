import {
  ListItemButton,
  ListItem,
  List,
  Box,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material';
import styled from 'styled-components/macro';
import InboxIcon from '@mui/icons-material/Inbox';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import NfcIcon from '@mui/icons-material/Nfc';
import EdgesensorHighIcon from '@mui/icons-material/EdgesensorHigh';
import LaptopIcon from '@mui/icons-material/Laptop';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from 'app/providers/authProvider';

export function SideListMenu() {
  const auth = useAuth();

  return (
    <Wrapper>
      <Box
        sx={{
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
        }}
      >
        <nav aria-label="main mailbox folders">
          <List>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="대시보드" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <CloudDownloadIcon />
                </ListItemIcon>
                <ListItemText primary="로그 데이터" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <DirectionsCarIcon />
                </ListItemIcon>
                <ListItemText primary="차량" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <NfcIcon />
                </ListItemIcon>
                <ListItemText primary="태그" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <EdgesensorHighIcon />
                </ListItemIcon>
                <ListItemText primary="장비" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <LaptopIcon />
                </ListItemIcon>
                <ListItemText primary="패키지" />
              </ListItemButton>
            </ListItem>
          </List>
        </nav>
        <nav aria-label="secondary mailbox folders">
          <Divider />
          <List>
            <ListItem
              disablePadding
              sx={{ backgroundColor: '#667a8a', color: 'white' }}
            >
              <ListItemButton>
                <ListItemIcon sx={{ color: 'white' }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary="로그아웃"
                  onClick={() => {
                    auth.logout(() => {});
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </nav>
      </Box>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;
