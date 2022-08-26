/* eslint-disable */
//admin@natours.iotest1234
import axios from 'axios';
import {showAlert} from './alerts';

export const login = async (email, password)=>{
    try{
        const res = await axios({
            method: "POST",
            url: "http://127.0.0.1:3000/api/v1/users/login",
            data:{
                email: email,
                password: password
            }
          })
          if (res.data.status === 'success') {
            console.log(res);
            showAlert('success', 'Logged in Successfully!');
            window.setTimeout(()=> {
                location.assign('/');
            }, 1500);
          }
    } catch(err) {
        showAlert('error', err.response.data.message);
        console.log(err.response.data);
    } 
};

export const logout = async () => {
    try {
      const res = await axios({
        method: 'GET',
        url: 'http://127.0.0.1:3000/api/v1/users/logout'
      });
      if ((res.data.status = 'success')) {
        showAlert('caution', 'Logged Out!');
        location.reload(true);
        location.assign('/');}
    } catch (err) {
      console.log(err.response);
      showAlert('error', 'Error logging out! Try again.');
    }
  };
export const signup = async (name, email, password, passwordConfirm)=>{
  console.log( name, email, password, passwordConfirm );

    try{
        const res = await axios({         
            method: "POST",
            url: "http://127.0.0.1:3000/api/v1/users/signup",
            data:{
                name: name,
                email: email,
                password: password,
                passwordConfirm: passwordConfirm
            }
          }) ;
          if (res.data.status === 'success') {
            console.log(res);
            showAlert('success', 'Signed in Successfully!');
            window.setTimeout(()=> {
                location.assign('/');
            }, 1500);
          }
    } catch(err) {
        showAlert('error', err.response.data.message);
        console.log(err.response.data);
    } 
};

  