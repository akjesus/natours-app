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
      `/api/v1/bookings/checkout/${tourId}`
    );
    // 2) Create checkout form + charge credit card
    const checkout = await stripe.redirectToCheckout({
      sessionId: session.data.session.id
      
    });
    // if (checkout) window.location.replace(session.data.session.url)
  } catch (err) {
    showAlert('error', err);
  }
};
