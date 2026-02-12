// Utility to get Telegram ID from WebApp

import axios from 'axios';

const api = axios.create({
  baseURL: 'https://aguero.pythonanywhere.com/api', // Change to your Django backend URL
  headers: {
    'Content-Type': 'application/json',

  },
});

export default api;