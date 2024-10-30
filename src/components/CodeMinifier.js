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
  MenuItem,
  Chip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import CompressIcon from '@mui/icons-material/Compress';

const languages = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'html', name: 'HTML' },
  { id: 'css', name: 'CSS' }
];

function CodeMinifier() {
  const [code, setCode] = useState('');
  const [minifiedCode, setMinifiedCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [stats, setStats] = useState(null);

  const minifyJavaScript = (code) => {
    try {
      // Eliminar comentarios de una línea
      code = code.replace(/\/\/.*/g, '');
      
      // Eliminar comentarios multilínea
      code = code.replace(/\/\*[\s\S]*?\*\//g, '');
      
      // Eliminar espacios en blanco innecesarios
      code = code.replace(/\s+/g, ' ');
      
      // Eliminar espacios alrededor de operadores
      code = code.replace(/\s*([+\-*/%=<>!&|,{}()[\];:])\s*/g, '$1');
      
      // Eliminar punto y coma innecesarios
      code = code.replace(/;+/g, ';');
      
      // Eliminar espacios después de palabras clave
      code = code.replace(/\b(if|for|while|switch|catch|function|return|var|let|const)\b\s+/g, '$1');
      
      return code.trim();
    } catch (error) {
      throw new Error(`Error al minificar JavaScript: ${error.message}`);
    }
  };

  const minifyCSS = (code) => {
    try {
      // Eliminar comentarios
      code = code.replace(/\/\*[\s\S]*?\*\//g, '');
      
      // Eliminar espacios en blanco innecesarios
      code = code.replace(/\s+/g, ' ');
      
      // Eliminar espacios alrededor de caracteres especiales
      code = code.replace(/\s*([{}:;,])\s*/g, '$1');
      
      // Eliminar punto y coma final en la última propiedad
      code = code.replace(/;\}/g, '}');
      
      // Eliminar ceros innecesarios
      code = code.replace(/0px/g, '0');
      
      return code.trim();
    } catch (error) {
      throw new Error(`Error al minificar CSS: ${error.message}`);
    }
  };

  const minifyHTML = (code) => {
    try {
      // Eliminar comentarios
      code = code.replace(/<!--[\s\S]*?-->/g, '');
      
      // Eliminar espacios en blanco entre tags
      code = code.replace(/>\s+</g, '><');
      
      // Eliminar espacios en blanco innecesarios
      code = code.replace(/\s+/g, ' ');
      
      // Eliminar espacios alrededor de atributos
      code = code.replace(/\s*=\s*/g, '=');
      
      return code.trim();
    } catch (error) {
      throw new Error(`Error al minificar HTML: ${error.message}`);
    }
  };

  const minifyCode = useCallback(() => {
    if (!code.trim()) {
      setNotification({
        open: true,
        message: 'Por favor ingresa código para minificar',
        severity: 'warning'
      });
      return;
    }

    try {
      let result = '';
      const originalSize = new Blob([code]).size;

      switch (language) {
        case 'javascript':
          result = minifyJavaScript(code);
          break;

        case 'css':
          result = minifyCSS(code);
          break;

        case 'html':
          result = minifyHTML(code);
          break;

        default:
          throw new Error('Lenguaje no soportado');
      }

      const minifiedSize = new Blob([result]).size;
      const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);

      setMinifiedCode(result);
      setStats({
        original: originalSize,
        minified: minifiedSize,
        savings: savings
      });

      setNotification({
        open: true,
        message: `Código minificado exitosamente. Reducción del ${savings}%`,
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: `Error al minificar: ${error.message}`,
        severity: 'error'
      });
    }
  }, [code, language]);

  const copyToClipboard = useCallback(() => {
    if (!minifiedCode) {
      setNotification({
        open: true,
        message: 'No hay contenido minificado para copiar',
        severity: 'warning'
      });
      return;
    }

    navigator.clipboard.writeText(minifiedCode);
    setNotification({
      open: true,
      message: 'Código minificado copiado al portapapeles',
      severity: 'success'
    });
  }, [minifiedCode]);

  const downloadCode = useCallback(() => {
    if (!minifiedCode) {
      setNotification({
        open: true,
        message: 'No hay contenido minificado para descargar',
        severity: 'warning'
      });
      return;
    }

    const blob = new Blob([minifiedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `minified.${language}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setNotification({
      open: true,
      message: 'Código minificado descargado exitosamente',
      severity: 'success'
    });
  }, [minifiedCode, language]);

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Minificador de Código
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Minificar código">
                <IconButton onClick={minifyCode} color="primary">
                  <CompressIcon />
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

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Código Original
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={15}
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
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Código Minificado
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={15}
                value={minifiedCode}
                InputProps={{ readOnly: true }}
                variant="outlined"
                sx={{
                  fontFamily: 'monospace',
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                  }
                }}
              />
            </Grid>
          </Grid>

          {stats && (
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Chip
                label={`Original: ${(stats.original / 1024).toFixed(2)}KB`}
                variant="outlined"
              />
              <Chip
                label={`Minificado: ${(stats.minified / 1024).toFixed(2)}KB`}
                variant="outlined"
              />
              <Chip
                label={`Reducción: ${stats.savings}%`}
                color="success"
              />
            </Box>
          )}

          <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>
            Consejos:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • La minificación reduce el tamaño del código eliminando espacios y comentarios
            <br />
            • JavaScript: También elimina caracteres innecesarios y acorta nombres
            <br />
            • CSS: Combina reglas similares y elimina propiedades redundantes
            <br />
            • HTML: Elimina espacios en blanco y comentarios
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

export default CodeMinifier;
