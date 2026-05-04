import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#D4A017', light: '#F5C842', dark: '#A07810', contrastText: '#000' },
    secondary: { main: '#1565C0', light: '#1976D2', dark: '#0D47A1', contrastText: '#fff' },
    background: { default: '#0A0E1A', paper: '#111827' },
    success: { main: '#4CAF50' },
    error: { main: '#F44336' },
    warning: { main: '#FF9800' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, backgroundImage: 'none' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 6 } },
    },
  },
});

export default theme;
