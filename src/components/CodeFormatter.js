import React, { useState, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease';
import js_beautify from 'js-beautify';

const languages = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'html', name: 'HTML' },
  { id: 'css', name: 'CSS' }
];

function CodeFormatter() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const formatCode = useCallback(() => {
    if (!code.trim()) {
      setNotification({
        open: true,
        message: 'Por favor ingresa código para formatear',
        severity: 'warning'
      });
      return;
    }

    try {
      let formatted = '';
      const options = {
        indent_size: 2,
        indent_char: ' ',
        max_preserve_newlines: 2,
        preserve_newlines: true,
        keep_array_indentation: false,
        break_chained_methods: false,
        indent_scripts: 'normal',
        brace_style: 'collapse',
        space_before_conditional: true,
        unescape_strings: false,
        jslint_happy: false,
        end_with_newline: true,
        wrap_line_length: 0,
        indent_inner_html: false,
        comma_first: false,
        e4x: false,
        indent_empty_lines: false
      };

      switch (language) {
        case 'javascript':
          formatted = js_beautify.js(code, options);
          break;
        case 'html':
          formatted = js_beautify.html(code, options);
          break;
        case 'css':
          formatted = js_beautify.css(code, options);
          break;
        default:
          throw new Error('Lenguaje no soportado');
      }

      setCode(formatted);
      setNotification({
        open: true,
        message: 'Código formateado exitosamente',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: `Error al formatear: ${error.message}`,
        severity: 'error'
      });
    }
  }, [code, language]);

  const copyToClipboard = useCallback(() => {
    if (!code.trim()) {
      setNotification({
        open: true,
        message: 'No hay contenido para copiar',
        severity: 'warning'
      });
      return;
    }

    navigator.clipboard.writeText(code);
    setNotification({
      open: true,
      message: 'Código copiado al portapapeles',
      severity: 'success'
    });
  }, [code]);

  const downloadCode = useCallback(() => {
    if (!code.trim()) {
      setNotification({
        open: true,
        message: 'No hay contenido para descargar',
        severity: 'warning'
      });
      return;
    }

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `formatted.${language}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setNotification({
      open: true,
      message: 'Código descargado exitosamente',
      severity: 'success'
    });
  }, [code, language]);

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Formateador de Código
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Formatear código">
                <IconButton onClick={formatCode} color="primary">
                  <FormatIndentIncreaseIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Copiar al portapapeles">
                <IconButton onClick={copyToClipboard}>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Descargar código">
                <IconButton onClick={downloadCode}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Lenguaje</InputLabel>
            <Select
              value={language}
              label="Lenguaje"
              onChange={(e) => setLanguage(e.target.value)}
            >
              {languages.map(lang => (
                <MenuItem value={lang.id} key={lang.id}>
                  {lang.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={20}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`Ingresa tu código ${languages.find(lang => lang.id === language)?.name} aquí...`}
            variant="outlined"
            sx={{
              fontFamily: 'monospace',
              '& .MuiInputBase-input': {
                fontFamily: 'monospace',
              }
            }}
          />

          <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>
            Consejos:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Selecciona el lenguaje correcto antes de formatear
            <br />
            • El formateador aplicará las mejores prácticas de estilo
            <br />
            • Puedes descargar el código formateado o copiarlo al portapapeles
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

export default CodeFormatter;
