import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  user: null,
  role: null, // 'artist' ou 'fan'
};

const getInitialState = () => {
  const saved = localStorage.getItem('userState');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return initialState;
    }
  }
  return initialState;
};

const userSlice = createSlice({
  name: 'user',
  initialState: getInitialState(),
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.role = action.payload.role;
      localStorage.setItem('userState', JSON.stringify({
        isAuthenticated: true,
        user: action.payload.user,
        role: action.payload.role,
      }));
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      localStorage.removeItem('userState');
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
