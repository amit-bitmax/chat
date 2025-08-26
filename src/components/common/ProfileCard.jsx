import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Stack,
  Switch,
  Box,
  Divider,
  Button,
  Avatar,
  List,
  ListItemButton
} from '@mui/material';
import { PowerSettingsNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useToggleBreakMutation } from '../../features/auth/authApi'; // ✅ Import your RTK hook
import { format } from 'date-fns';
import StyledBadge from './StyledBadge';

const IMG_BASE_URL = 'https://chatcrmapi.onrender.com/uploads/profile';

const ProfileCard = ({ agent, onToggle }) => {
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(agent?.elapsedTime || 0);
  const [operProfile, setOpenProfile] = useState(false);
  const [toggleBreak] = useToggleBreakMutation();
  const cardToggle = () => {
    setOpenProfile((prev) => !prev);
    navigate('/agent/profile');
  };

  useEffect(() => {
    let timer;
    if (!agent?.data?.breakLogs?.start) {
      timer = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [agent?.data?.breakLogs?.start]);

  const formatToIST = (date) => {
    return format(new Date(date), 'hh:mm:ss a', {
      timeZone: 'Asia/Kolkata',
    });
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleToggle = async () => {
    try {
      await toggleBreak().unwrap(); // ✅ Call API
      toast.success(`Status changed to ${agent?.data?.workStatus ? 'Break' : 'Active'}`);
      onToggle(agent._id); 
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <Card variant="outlined" sx={{ p: 2, border: 'none', width: 260 }}>
      <Stack spacing={2} direction="row" alignItems="center">
        <StyledBadge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant={agent?.data?.is_active === true ? "dot" : "none"}
        >
          <Avatar alt={agent?.data?.first_name} src={`${IMG_BASE_URL}/${agent?.data?.profileImage}`} sx={{ height: "50px", width: '50px' }} />
        </StyledBadge>
        <Box>
          <Typography variant="body1">{agent?.data?.email}</Typography>
          <Typography variant="body2">E.ID: {agent?.data?.employee_id}</Typography>
           <Typography variant="body2">Department: {agent?.data?.department}</Typography>
           <Typography variant='body2'sx={{color: '#827717',}}>login Time : {agent?.data?.login_time && formatToIST(agent?.data?.login_time)}</Typography>
        </Box>
      </Stack>
      <Divider sx={{ mt: 1, mb: 1, background: '#999', width: '100%' }} />
      <Stack spacing={2}>
        <Box>
          {agent?.data?.breakLogs?.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" fontWeight="bold">
                Last Break Info:
              </Typography>
              <Typography variant="caption">
                Start: {formatToIST(agent?.data?.breakLogs[0].start)}
              </Typography>
              <br />
              <Typography variant="caption">
                End: {formatToIST(agent?.data?.breakLogs[0].end)}
              </Typography>
              <br />
              <Typography variant="caption">
                Duration: {formatToIST(agent?.data?.breakLogs[0].duration)}
              </Typography>
            </Box>
          )}
          <Typography>IP: {agent?.data?.location?.ip}</Typography>
          <Typography>City: {agent?.data?.location?.city}, {agent?.data?.location?.region}</Typography>
          <Typography>Country: {agent?.data?.location?.country}</Typography>
          <Typography>ISP: {agent?.data?.location?.isp}</Typography>
          <Typography>Timezone: {agent?.data?.location?.timezone}</Typography>

          <Stack spacing={1} alignItems={'center'} direction={'row'}>
            <Typography variant='body2'>Status:</Typography>
            <Typography
              variant="caption"
              color={agent?.data?.workStatus ? "green": "red" }
            >
              {agent?.data?.data?.workStatus ? "On Break" : "Active"}
            </Typography>

            <Switch
              size="small"
              checked={!agent?.data?.workStatus}
              onChange={handleToggle} //
              color="success"
              inputProps={{ 'aria-label': 'status toggle' }}
            />
          </Stack>
        </Box>
      </Stack>

      <Divider sx={{ mt: 1, mb: 1, background: '#999', width: '100%' }} />
      <List>
        <Typography variant="body1" color="info.main" sx={{ mb: 1 }}>
          Accounts
        </Typography>
        <ListItemButton onClick={cardToggle}>
          Profile
        </ListItemButton>
      </List>

      <Button onClick={handleLogout} fullWidth color="error" variant="outlined">
        <PowerSettingsNew sx={{ mr: 1 }} /> Logout
      </Button>
    </Card>
  );
};

export default ProfileCard;
