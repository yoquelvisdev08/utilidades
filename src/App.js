import React from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline 
} from '@mui/material';
import FileConverterHub from './components/FileConverterHub';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FileConverterHub />
    </ThemeProvider>
  );
}

export default App;
