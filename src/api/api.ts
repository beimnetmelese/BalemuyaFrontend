// Utility to get Telegram ID from WebApp
export function getTelegramId(): string | null {
  try {
    // @ts-ignore
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
      // @ts-ignore
      return window.Telegram.WebApp.initDataUnsafe.user.id?.toString() || null;
    }
  } catch (e) {}
  return null;
}
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://balemuyabackend.onrender.com/api', // Change to your Django backend URL
  headers: {
    'Content-Type': 'application/json',

  },
});

export default api;