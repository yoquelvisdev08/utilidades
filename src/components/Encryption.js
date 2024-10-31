import React, { useState, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Slider
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SecurityIcon from '@mui/icons-material/Security';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

// Función para encriptar texto usando Base64
const encryptBase64 = (text) => {
  return btoa(text);
};

// Función para desencriptar texto Base64
const decryptBase64 = (text) => {
  try {
    return atob(text);
  } catch (e) {
    throw new Error('Texto inválido para desencriptar');
  }
};

// Función para encriptar texto usando César
const encryptCaesar = (text, shift) => {
  return text
    .split('')
    .map(char => {
      if (char.match(/[a-z]/i)) {
        const code = char.charCodeAt(0);
        const isUpperCase = code >= 65 && code <= 90;
        const base = isUpperCase ? 65 : 97;
        return String.fromCharCode(((code - base + shift) % 26) + base);
      }
      return char;
    })
    .join('');
};

// Función para desencriptar texto César
const decryptCaesar = (text, shift) => {
  return encryptCaesar(text, 26 - shift);
};

function Encryption() {
  const [mode, setMode] = useState('encrypt');
  const [method, setMethod] = useState('base64');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [shift, setShift] = useState(3);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleModeChange = (event, newMode) => {
    setMode(newMode);
    setOutput('');
  };

  const handleMethodChange = (event) => {
    setMethod(event.target.value);
    setOutput('');
  };

  const handleProcess = () => {
    if (!input) {
      setSnackbar({
        open: true,
        message: 'Por favor ingresa un texto',
        severity: 'error'
      });
      return;
    }

    try {
      if (method === 'base64') {
        setOutput(mode === 'encrypt' ? encryptBase64(input) : decryptBase64(input));
      } else if (method === 'caesar') {
        setOutput(mode === 'encrypt' ? encryptCaesar(input, shift) : decryptCaesar(input, shift));
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output).then(() => {
      setSnackbar({
        open: true,
        message: 'Texto copiado al portapapeles',
        severity: 'success'
      });
    });
  }, [output]);

  const handleSwap = () => {
    setInput(output);
    setOutput('');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <SecurityIcon color="primary" />
        <Typography variant="h5" component="h1">
          Encriptación de Texto
        </Typography>
      </Box>

      <Tabs value={mode} onChange={handleModeChange} sx={{ mb: 3 }}>
        <Tab value="encrypt" label="Encriptar" />
        <Tab value="decrypt" label="Desencriptar" />
      </Tabs>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Método de Encriptación</InputLabel>
            <Select value={method} onChange={handleMethodChange} label="Método de Encriptación">
              <MenuItem value="base64">Base64</MenuItem>
              <MenuItem value="caesar">Cifrado César</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {method === 'caesar' && (
          <Grid item xs={12}>
            <Typography gutterBottom>Desplazamiento: {shift}</Typography>
            <Slider
              value={shift}
              onChange={(e, newValue) => setShift(newValue)}
              min={1}
              max={25}
              marks
              valueLabelDisplay="auto"
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label={mode === 'encrypt' ? 'Texto a Encriptar' : 'Texto a Desencriptar'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleProcess}
            startIcon={<SecurityIcon />}
          >
            {mode === 'encrypt' ? 'Encriptar' : 'Desencriptar'}
          </Button>
          {output && (
            <Button
              variant="outlined"
              onClick={handleSwap}
              startIcon={<SwapHorizIcon />}
            >
              Intercambiar
            </Button>
          )}
        </Grid>

        {output && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Resultado"
              value={output}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <Tooltip title="Copiar al portapapeles">
                    <IconButton onClick={handleCopy} edge="end">
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />
          </Grid>
        )}
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default Encryption;
