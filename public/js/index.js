/* eslint-disable */
// import "@babel/polyfill";
import { displayMap } from './mapBox';
import {login, logout, signup} from './login';
import { updateAccount } from './updateAccount';
import { bookTour } from './stripe';
import {showAlert} from './alerts';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateBtn = document.querySelector('.form-user-data');
const updatePass = document.querySelector('.form-user-settings');
const signupForm = document.querySelector('.form--signup');
const bookBtn = document.getElementById('book-tour');
const alertMessage = document.querySelector('.body').dataset.alert;
 
//DELEGATION
if(mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
};

//ACTIONS
if (loginForm) {

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;      
        login(email, password);
      });
};
if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (updateBtn) {
  updateBtn.addEventListener('submit', (e) => {
    e.preventDefault(); 
    const form = new FormData()
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);    
    form.append('photo', document.getElementById('photo').files[0]); 
    updateAccount(form, 'data');;
  });

}

if (updatePass) {
  updatePass.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    document.querySelector('.btn--update').textContent = 'Updating Password...'
    
    const oldPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;      
    const passwordConfirm = document.getElementById('password-confirm').value;      
    await updateAccount({ oldPassword, newPassword, passwordConfirm }, 'password');

  document.querySelector('.btn--update').textContent = 'Change password'
  document.getElementById('password-current').value = ''
  document.getElementById('password').value = ''
  document.getElementById('password-confirm').value = ''
  });
  
};

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    document.querySelector('.btn--signup').textContent = 'Signing Up...'
    
    const name = document.getElementById('name').value;      
    const email = document.getElementById('email').value;      
    const password = document.getElementById('password').value;      
    const passwordConfirm = document.getElementById('password-confirm').value;  
    await signup( name, email, password, passwordConfirm );

  document.querySelector('.btn--signup').textContent = 'Sign Up'
  document.getElementById('name').value = ''
  document.getElementById('email').value = ''
  document.getElementById('password').value = ''
  document.getElementById('password-confirm').value = ''
  });
  
};

if (bookBtn)
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

if (alertMessage) {
  showAlert('success', alertMessage, 15);
}
