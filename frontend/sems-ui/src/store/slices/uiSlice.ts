import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  drawerOpen: boolean;
  notifications: Notification[];
  alertMessage: {
    type: 'success' | 'error' | 'info' | 'warning' | null;
    message: string | null;
  };
  darkMode: boolean;
  modalState: {
    open: boolean;
    type: string | null;
    data: any | null;
  };
}

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  timestamp: string;
  link?: string;
}

const initialState: UIState = {
  drawerOpen: true,
  notifications: [],
  alertMessage: {
    type: null,
    message: null,
  },
  darkMode: localStorage.getItem('darkMode') === 'true',
  modalState: {
    open: false,
    type: null,
    data: null,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDrawer: (state) => {
      state.drawerOpen = !state.drawerOpen;
    },
    setDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.drawerOpen = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const id = Date.now().toString();
      state.notifications.unshift({
        ...action.payload,
        id,
        timestamp: new Date().toISOString(),
        read: false,
      });
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setAlertMessage: (state, action: PayloadAction<UIState['alertMessage']>) => {
      state.alertMessage = action.payload;
    },
    clearAlertMessage: (state) => {
      state.alertMessage = {
        type: null,
        message: null,
      };
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode.toString());
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', state.darkMode.toString());
    },
    openModal: (state, action: PayloadAction<{ type: string; data?: any }>) => {
      state.modalState = {
        open: true,
        type: action.payload.type,
        data: action.payload.data || null,
      };
    },
    closeModal: (state) => {
      state.modalState = {
        ...state.modalState,
        open: false,
      };
    },
    updateModalData: (state, action: PayloadAction<any>) => {
      if (state.modalState.open) {
        state.modalState.data = action.payload;
      }
    },
  },
});

export const {
  toggleDrawer,
  setDrawerOpen,
  addNotification,
  markNotificationAsRead,
  clearNotifications,
  setAlertMessage,
  clearAlertMessage,
  toggleDarkMode,
  setDarkMode,
  openModal,
  closeModal,
  updateModalData,
} = uiSlice.actions;

export default uiSlice.reducer; 