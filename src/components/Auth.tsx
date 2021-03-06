import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { auth, provider, storage } from '../firebase';
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Paper,
  Box,
  Grid,
  Typography,
  IconButton,
  Modal
} from '@material-ui/core'
import SendIcon from "@material-ui/icons/Send";
import CameraIcon from "@material-ui/icons/Camera";
import EmailIcon from "@material-ui/icons/Email";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import { makeStyles } from '@material-ui/core/styles';

import styles from './css/auth.module.css';
import { updateUserProfile } from '../features/userSlice';

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
};

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage:
      'url(https://images.unsplash.com/photo-1610728989927-d440224c2e9e?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=668&q=80)',
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  modal: {
    outline: "none",
    position: "absolute",
    width: 400,
    borderRadius: 10,
    backgroundColor: "white",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(10),
  }
}));

const Auth: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [avatarImg, setAvatarImg] = useState< File | null >(null);
  const [isLogin, setIsLogin] = useState(true);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files![0]) {
      setAvatarImg(e.target.files![0]);
      e.target.value = '';
    }
  }

  const signinEmail = async () => {
    await auth.signInWithEmailAndPassword(email, password);
  }

  const signupEmail = async () => {
    const authUser = await auth.createUserWithEmailAndPassword(email, password);
    let url = '';
    if(avatarImg) {

      // set random char to fileName
      const S =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const fileName = randomChar + "_" + avatarImg.name;

      // set file to firebase storage
      await storage.ref(`avatars/${fileName}`).put(avatarImg);
      url = await storage.ref('avatars').child(fileName).getDownloadURL();

      // set file to user
      await authUser.user?.updateProfile({
        displayName: userName,
        photoURL: url
      })

      // update state
      dispatch(updateUserProfile({
        displayName: userName,
        photoURL: url
      }));
    }
  };

  const signinGoogle = async () => {
    await auth.signInWithPopup(provider).catch((err) => alert(err.message))
  };

  const formSubmitHandler = async () => {
    if(isLogin) {
      // signin
      try {
        await signinEmail();
      } catch(err) {
        alert(err.message);
      }
    } else {
      // register
      try {
        await signupEmail();
      } catch(err) {
        alert(err.message);
      }
    }
  }

  const sendResetEmail = async (e: React.MouseEvent<HTMLElement>) => {
    await auth
      .sendPasswordResetEmail(resetEmail)
      .then(() => {
        setIsOpenModal(false);
        setResetEmail('');
      })
      .catch(err => {
        alert(err.message);
        setResetEmail('');
      })
  }

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <form className={classes.form} noValidate>
            { !isLogin &&
            <>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={userName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setUserName(e.target.value);
                }}
              />
              <Box textAlign="center">
                <IconButton>
                  <label>
                    <AccountCircleIcon
                      fontSize="large"
                      className={
                        avatarImg
                          ? styles.login_addIconLoaded
                          : styles.login_addIcon
                      }
                    />
                    <input
                      className={styles.login_hiddenIcon}
                      type="file"
                      onChange={onChangeImageHandler}
                    />
                  </label>
                </IconButton>
              </Box>
            </>}
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              startIcon={<EmailIcon />}
              onClick={() => formSubmitHandler()}
              disabled={
                isLogin
                  ? !email || password.length < 6
                  : !userName || !email || password.length < 6 || !avatarImg
              }
            >
              { isLogin ? 'Login' : 'Register' }
            </Button>
            <Grid container>
              <Grid item xs>
                <span
                  className={styles.login_reset}
                  onClick={() => setIsOpenModal(true)}
                >Forgot passord?</span>
              </Grid>
              <Grid item>
                <span 
                  className={styles.login_toggleMode}
                  onClick={() => setIsLogin(!isLogin)}
                >
                  { isLogin ? 'Create new account' : 'Back to login' }
                </span>
              </Grid>
            </Grid>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<CameraIcon />}
              className={classes.submit}
              onClick={signinGoogle}
            >
              Sign In with Google
            </Button>
          </form>

          <Modal open={isOpenModal} onClose={() => setIsOpenModal(false)}>
            <div style={getModalStyle()} className={classes.modal}>
              <div className={styles.login_modal}>
                <TextField
                  InputLabelProps={{
                    shrink: true,
                  }}
                  type="email"
                  name="email"
                  label="Reset E-mail"
                  value={resetEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setResetEmail(e.target.value);
                  }}
                />
                <IconButton onClick={sendResetEmail}>
                  <SendIcon />
                </IconButton>
              </div>
            </div>
          </Modal>

        </div>
      </Grid>
    </Grid>
  );
}
export default Auth;