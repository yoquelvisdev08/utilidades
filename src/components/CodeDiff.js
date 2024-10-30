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
  Divider
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';

const languages = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'html', name: 'HTML' },
  { id: 'css', name: 'CSS' },
  { id: 'text', name: 'Texto Plano' }
];

function CodeDiff() {
  const [code1, setCode1] = useState('');
  const [code2, setCode2] = useState('');
  const [diff, setDiff] = useState([]);
  const [language, setLanguage] = useState('text');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const findDiff = (text1, text2) => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const result = [];
    let i = 0, j = 0;

    while (i < lines1.length || j < lines2.length) {
      if (i >= lines1.length) {
        // Resto de líneas en text2 son adiciones
        result.push({
          added: true,
          removed: false,
          value: lines2[j] + '\n'
        });
        j++;
      } else if (j >= lines2.length) {
        // Resto de líneas en text1 son eliminaciones
        result.push({
          added: false,
          removed: true,
          value: lines1[i] + '\n'
        });
        i++;
      } else if (lines1[i] === lines2[j]) {
        // Líneas iguales
        result.push({
          added: false,
          removed: false,
          value: lines1[i] + '\n'
        });
        i++;
        j++;
      } else {
        // Líneas diferentes
        result.push({
          added: false,
          removed: true,
          value: lines1[i] + '\n'
        });
        result.push({
          added: true,
          removed: false,
          value: lines2[j] + '\n'
        });
        i++;
        j++;
      }
    }

    return result;
  };

  const compareCodes = useCallback(() => {
    if (!code1.trim() || !code2.trim()) {
      setNotification({
        open: true,
        message: 'Por favor ingresa código en ambos campos',
        severity: 'warning'
      });
      return;
    }

    try {
      const differences = findDiff(code1, code2);
      setDiff(differences);
      
      setNotification({
        open: true,
        message: 'Comparación realizada exitosamente',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: `Error al comparar: ${error.message}`,
        severity: 'error'
      });
    }
  }, [code1, code2]);

  const copyDiff = useCallback(() => {
    if (diff.length === 0) {
      setNotification({
        open: true,
        message: 'No hay diferencias para copiar',
        severity: 'warning'
      });
      return;
    }

    const diffText = diff.map(part => {
      const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
      return prefix + part.value;
    }).join('');

    navigator.clipboard.writeText(diffText);
    setNotification({
      open: true,
      message: 'Diferencias copiadas al portapapeles',
      severity: 'success'
    });
  }, [diff]);

  const downloadDiff = useCallback(() => {
    if (diff.length === 0) {
      setNotification({
        open: true,
        message: 'No hay diferencias para descargar',
        severity: 'warning'
      });
      return;
    }

    const diffText = diff.map(part => {
      const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
      return prefix + part.value;
    }).join('');

    const blob = new Blob([diffText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diff.${language}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setNotification({
      open: true,
      message: 'Diferencias descargadas exitosamente',
      severity: 'success'
    });
  }, [diff, language]);

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Comparador de Código
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Comparar código">
                <IconButton onClick={compareCodes} color="primary">
                  <CompareArrowsIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Copiar diferencias">
                <IconButton onClick={copyDiff}>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Descargar diferencias">
                <IconButton onClick={downloadDiff}>
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
                value={code1}
                onChange={(e) => setCode1(e.target.value)}
                placeholder="Ingresa el código original aquí..."
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
                Código Modificado
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={15}
                value={code2}
                onChange={(e) => setCode2(e.target.value)}
                placeholder="Ingresa el código modificado aquí..."
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

          {diff.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Diferencias Encontradas
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  maxHeight: '400px',
                  overflow: 'auto'
                }}
              >
                <pre style={{ margin: 0, fontFamily: 'monospace' }}>
                  {diff.map((part, index) => (
                    <span
                      key={index}
                      style={{
                        color: part.added ? 'green' : part.removed ? 'red' : 'grey',
                        backgroundColor: part.added ? '#e6ffe6' : part.removed ? '#ffe6e6' : 'transparent',
                        display: 'block'
                      }}
                    >
                      {(part.added ? '+ ' : part.removed ? '- ' : '  ') + part.value}
                    </span>
                  ))}
                </pre>
              </Paper>
            </Box>
          )}

          <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>
            Consejos:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Las líneas en verde indican adiciones
            <br />
            • Las líneas en rojo indican eliminaciones
            <br />
            • Las líneas en gris no han sido modificadas
            <br />
            • Puedes copiar o descargar las diferencias encontradas
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

export default CodeDiff;
