import { login } from './login'
import '@babel/polyfill'
import { displayMap } from './mapBox';
import { logout } from './login';
import { updateSettings } from './updateSettings';
//DOM Elements: To load this script only if this element is present
const mapBox = document.getElementById('map')
const loginForm = document.querySelector(".form--login")
const logOutBtn = document.querySelector(".nav__el--logout")
const userDataForm = document.querySelector(".form-user-data")
const userPasswordForm = document.querySelector('.form-user-password');

//VALUES


if (mapBox) {
    const locations = JSON.parse(document.getElementById('map').dataset.locations)
    displayMap(locations)
}

if (loginForm) {
    document.querySelector(".form--login").addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        login(email, password)
    })
}

if (logOutBtn) {
    logOutBtn.addEventListener('click', logout)
}

if (userDataForm) {
    userDataForm.addEventListener('submit', e => {
        e.preventDefault()
        const email = document.getElementById('email').value
        const name = document.getElementById('name').value
        updateSettings({ name, email }, 'data')

    })
}

if (userPasswordForm)
    userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating...';

        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSettings(
            { passwordCurrent, password, passwordConfirm },
            'password'
        );

        document.querySelector('.btn--save-password').textContent = 'Save password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
