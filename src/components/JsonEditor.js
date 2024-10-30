import React, { useState, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  TextField,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DownloadIcon from '@mui/icons-material/Download';

function JsonEditor() {
  const [jsonInput, setJsonInput] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const validateJson = useCallback((input) => {
    try {
      if (!input.trim()) {
        setIsValid(true);
        setError('');
        return;
      }
      JSON.parse(input);
      setIsValid(true);
      setError('');
    } catch (e) {
      setIsValid(false);
      setError(e.message);
    }
  }, []);

  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    setJsonInput(newValue);
    validateJson(newValue);
  }, [validateJson]);

  const formatJson = useCallback(() => {
    try {
      if (!jsonInput.trim()) {
        setNotification({
          open: true,
          message: 'Por favor ingresa un JSON para formatear',
          severity: 'warning'
        });
        return;
      }

      const formatted = JSON.stringify(JSON.parse(jsonInput), null, 2);
      setJsonInput(formatted);
      setNotification({
        open: true,
        message: 'JSON formateado exitosamente',
        severity: 'success'
      });
    } catch (e) {
      setNotification({
        open: true,
        message: 'Error al formatear: JSON inválido',
        severity: 'error'
      });
    }
  }, [jsonInput]);

  const copyToClipboard = useCallback(() => {
    if (!jsonInput.trim()) {
      setNotification({
        open: true,
        message: 'No hay contenido para copiar',
        severity: 'warning'
      });
      return;
    }

    navigator.clipboard.writeText(jsonInput);
    setNotification({
      open: true,
      message: 'JSON copiado al portapapeles',
      severity: 'success'
    });
  }, [jsonInput]);

  const downloadJson = useCallback(() => {
    if (!jsonInput.trim()) {
      setNotification({
        open: true,
        message: 'No hay contenido para descargar',
        severity: 'warning'
      });
      return;
    }

    try {
      const blob = new Blob([jsonInput], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'data.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setNotification({
        open: true,
        message: 'JSON descargado exitosamente',
        severity: 'success'
      });
    } catch (e) {
      setNotification({
        open: true,
        message: 'Error al descargar el archivo',
        severity: 'error'
      });
    }
  }, [jsonInput]);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Editor JSON
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Formatear JSON">
                <IconButton onClick={formatJson} color="primary">
                  <FormatIndentIncreaseIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Copiar al portapapeles">
                <IconButton onClick={copyToClipboard}>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Descargar JSON">
                <IconButton onClick={downloadJson}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={20}
            value={jsonInput}
            onChange={handleInputChange}
            placeholder="Ingresa tu JSON aquí..."
            variant="outlined"
            error={!isValid}
            sx={{
              fontFamily: 'monospace',
              '& .MuiInputBase-input': {
                fontFamily: 'monospace',
              }
            }}
          />

          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            {isValid ? (
              <>
                <CheckCircleIcon color="success" />
                <Typography color="success.main">
                  JSON válido
                </Typography>
              </>
            ) : (
              <>
                <ErrorIcon color="error" />
                <Typography color="error">
                  Error: {error}
                </Typography>
              </>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Consejos:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Usa el botón de formato para dar estructura a tu JSON
            <br />
            • La validación es en tiempo real
            <br />
            • Puedes copiar y descargar el contenido usando los botones superiores
          </Typography>
        </Paper>
      </Grid>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
}

export default JsonEditor;
