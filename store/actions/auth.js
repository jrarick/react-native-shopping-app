import { AsyncStorage } from 'react-native';

export const AUTHENTICATE = 'AUTHENTICATE';
export const LOGOUT = 'LOGOUT';

let timer;

export function authenticate(userId, token, expiryTime) {
  return dispatch => {
    dispatch(setLogoutTimer(expiryTime));
    dispatch({ type: AUTHENTICATE, userId: userId, token: token });
  };
}

export function signup(email, password) {
  return async dispatch => {
    const response = await fetch(
      'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCcCun7aHgL1tlHOMGkcQatkM6TCM2F338',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true,
        }),
      }
    );

    if (!response.ok) {
      const errorResData = await response.json();
      const errorId = errorResData.error.message;
      let message = 'Something went wrong!';
      if (errorId === 'EMAIL_EXISTS') {
        message = 'This email exists already!';
      }
      throw new Error(message);
    }

    const resData = await response.json();
    console.log(resData);
    dispatch(authenticate(
      resData.localId,
      resData.idToken,
      parseInt(resData.expiresIn) * 1000,
    ));
    const expirationDate = new Date(
      new Date().getTime() + +resData.expiresIn * 1000
    );
    saveDataToStorage(resData.idToken, resData.localId, expirationDate);
  };
}

export function login(email, password) {
  return async dispatch => {
    const response = await fetch(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCcCun7aHgL1tlHOMGkcQatkM6TCM2F338',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true,
        }),
      }
    );

    if (!response.ok) {
      const errorResData = await response.json();
      const errorId = errorResData.error.message;
      let message = 'Something went wrong!';
      if (errorId === 'EMAIL_NOT_FOUND') {
        message = 'This email could not be found!';
      } else if (errorId === 'INVALID_PASSWORD') {
        message = 'This password is not valid!';
      }
      throw new Error(message);
    }

    const resData = await response.json();
    console.log(resData);
    dispatch(authenticate(
      resData.localId,
      resData.idToken,
      parseInt(resData.expiresIn) * 1000,
    ));
    const expirationDate = new Date(
      new Date().getTime() + +resData.expiresIn * 1000
    );
    saveDataToStorage(resData.idToken, resData.localId, expirationDate);
  };
}

export function logout() {
  clearLogoutTimer();
  AsyncStorage.removeItem('userData');
  return { type: LOGOUT };
}

function clearLogoutTimer() {
  if (timer) {
    clearTimeout(timer);
  }
}

function setLogoutTimer(expirationTime) {
  return dispatch => {
    timer = setTimeout(() => {
      dispatch(logout());
    }, expirationTime);
  };
}

function saveDataToStorage(token, userId, expirationDate) {
  AsyncStorage.setItem(
    'userData',
    JSON.stringify({
      token: token,
      userId: userId,
      expirtyDate: expirationDate.toISOString(),
    })
  );
}