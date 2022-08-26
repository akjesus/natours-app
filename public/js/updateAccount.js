import axios from 'axios';
import {showAlert} from './alerts';

export const updateAccount = async (data, type)=>{
    try{
        const url = type ==='password' 
        ? 'http://127.0.0.1:3000/api/v1/users/updatePassword'
        : 'http://127.0.0.1:3000/api/v1/users/updateMe'
        const res = await axios({
            method: "PATCH",
            url: url,
            data
          })
          if (res.data.status === 'success') {
            console.log(res);
            showAlert('success', `${type[0].toUpperCase() + type.slice(1)} Updated Successfully!`);
            window.setTimeout(()=> {
                // location.reload(true);
            }, 1500);
          }
    } catch(err) {
        showAlert('error', err.response.data.message);
        console.log(err.response.data);
    } 
};

