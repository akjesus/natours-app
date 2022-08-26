/* eslint-disable */
import axios from 'axios';
import {showAlert} from './alerts';
const stripe = Stripe(
  'pk_test_51LZeFeAsZRBt2uMtHpzEUPyRkmG9xQxJqPQciTojYe4N8lEVNmO3kYPP9gJW2ewueQFmDNEwE8ce7VBU87ujinNJ00o8hNvRHf'
);
export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout/${tourId}`
    );
    console.log(session);
    // 2) Create checkout form + charge credit card
    const checkout = await stripe.redirectToCheckout({
      sessionId: session.data.session.id
      
    });
    // if (checkout) window.location.replace(session.data.session.url)
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
