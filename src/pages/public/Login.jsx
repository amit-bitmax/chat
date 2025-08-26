import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, InputAdornment, IconButton,
  Grid, TextField, Typography, useTheme, Divider, CircularProgress, Backdrop,
  LinearProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  EmailOutlined, LockOutlined, Visibility, VisibilityOff
} from '@mui/icons-material';

import { useLoginUserMutation } from '../../features/auth/authApi';
import { connectSocket } from '../../sockets/sockets';

import VD1 from '../../assets/videos/SecureLogin.mp4';
const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      employee_id: '',
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values) => {
  try {
    const res = await loginUser(values).unwrap();
    const userId = res.data?._id || res?.data?.id;
    const token = res.token;
    // ✅ Save token and initialize socket
    localStorage.setItem('token',token);
    connectSocket({ token, id: userId });
    // ✅ Role-based navigation
    const roleRoutes = {
      Admin: '/admin',
      Agent: '/agent',
      QA: '/qa',
      Customer: '/customer',
    };

    const redirectPath = roleRoutes[res?.data.role];
    if (redirectPath) {
      toast.success(`${res?.data?.role} login successful!`);
      navigate(redirectPath);
    } else {
      toast.error('Access denied: Unauthorized role');
    }

  } catch (error) {
    console.error('Login error:', error);
    toast.error(error?.data?.message || 'Login failed');
  }
}

  });

  const renderTextField = (label, name, icon, type = 'text', showToggle = false) => (
    <>
      <Typography variant="body2" sx={{ my: 1 ,color:'info.light'}}>{label}:</Typography>
      <TextField
        fullWidth
        placeholder={label}
        type={showToggle ? (showPassword ? 'text' : 'password') : type}
        {...formik.getFieldProps(name)}
        error={formik.touched[name] && Boolean(formik.errors[name])}
        helperText={formik.touched[name] && formik.errors[name]}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {icon}
            </InputAdornment>
          ),
          ...(showToggle && {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                  {showPassword
                    ? <Visibility sx={{ color: theme.palette.info.light }} />
                    : <VisibilityOff sx={{ color: theme.palette.info.light }} />}
                </IconButton>
              </InputAdornment>
            ),
          }),
          sx: {
            color:'info.light',
            borderRadius: '5px',
            border: '1px solid #eee',
            fontWeight: 100,
          }
        }}
      />
    </>
  );

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} pauseOnFocusLoss draggable />

      {/* Transparent loading overlay */}
    
      <Box
        sx={{
          position:'relative',
          height: '100vh',
          width: '100vw',
          // backgroundImage: `url(${IM1})`,
          background: 'linear-gradient(rgba(255, 255, 255, 1), rgba(254, 253, 253, 0.3)), url(${IM1})',
          backgroundSize: 'cover',
          // backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          
        }}
      >
        {/* <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.1)', 
            zIndex: 1,
          }}
        /> */}
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container justifyContent="left">
            <Grid size={{xs:12}}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)',
                  // background: 'transparent',
                  //  backgroundImage: `url(${IM1})`,
                  background: 'linear-gradient(rgba(255, 126, 90, 1.00), rgba(239, 120, 60, 0.3)), url(${})',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  width: '100%',
                  // marginLeft: '10px',
                  marginRight: '20px',
                  maxWidth: '400px',
                }}
              >
                <Box  sx={{ width: '100%', }}>
                  {isLoading && <LinearProgress   />}
        
    
                <CardContent>
                  <Typography variant="h4" textAlign="center" color='info.light'>Login</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
                    {renderTextField('Employee ID', 'employee_id', <EmailOutlined sx={{ color: theme.palette.info.light }} />)}
                    {renderTextField('Email', 'email', <EmailOutlined sx={{ color: theme.palette.info.light }} />)}
                    {renderTextField('Password', 'password', <LockOutlined sx={{ color: theme.palette.info.light }} />, 'password', true)}

                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={isLoading}
                      sx={{ mt: 2 }}
                    >
                      Login
                    </Button>
                  </Box>
                </CardContent>
                </Box> 
              </Card>
            </Grid>
          </Grid>
         </Box>
          <Box sx={{
            // position: 'absolute',
            bottom: 0,
            right: 0,
            zIndex: 1
          }}>
             <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'relative',
          bottom: 0,
          right: -150,
          width: '100vh',
         height: '90vh',
          zIndex: 1,
          objectFit: 'cover'
        }}
      >
        <source src={VD1} type="video/mp4" />
      </video>
          </Box>
      </Box>
    </>
  );
};

export default Login;
