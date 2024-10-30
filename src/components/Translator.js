import React, { useState, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TranslateIcon from '@mui/icons-material/Translate';

const languages = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'Inglés' },
  { code: 'fr', name: 'Francés' },
  { code: 'de', name: 'Alemán' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Portugués' },
  { code: 'ru', name: 'Ruso' },
  { code: 'zh', name: 'Chino' },
  { code: 'ja', name: 'Japonés' },
  { code: 'ko', name: 'Coreano' },
  { code: 'ar', name: 'Árabe' },
  { code: 'hi', name: 'Hindi' }
];

function Translator() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('es');
  const [targetLang, setTargetLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const translateText = useCallback(async () => {
    if (!sourceText.trim()) {
      setNotification({
        open: true,
        message: 'Por favor ingresa texto para traducir',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      // Usando la API de LibreTranslate (servicio gratuito y de código abierto)
      const response = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: sourceText,
          source: sourceLang,
          target: targetLang
        })
      });

      if (!response.ok) {
        throw new Error('Error en la traducción');
      }

      const data = await response.json();
      setTranslatedText(data.translatedText);

      setNotification({
        open: true,
        message: 'Texto traducido exitosamente',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [sourceText, sourceLang, targetLang]);

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setNotification({
      open: true,
      message: 'Texto copiado al portapapeles',
      severity: 'success'
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Traductor
            </Typography>
            <TranslateIcon sx={{ fontSize: 30 }} />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Idioma de origen</InputLabel>
                <Select
                  value={sourceLang}
                  label="Idioma de origen"
                  onChange={(e) => setSourceLang(e.target.value)}
                >
                  {languages.map(lang => (
                    <MenuItem value={lang.code} key={lang.code}>
                      {lang.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={8}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Ingresa el texto a traducir..."
                variant="outlined"
              />

              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Tooltip title="Copiar texto">
                  <IconButton onClick={() => copyToClipboard(sourceText)}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={swapLanguages}
                startIcon={<SwapHorizIcon />}
                sx={{ mt: { xs: 0, md: 4 } }}
              >
                Intercambiar
              </Button>
            </Grid>

            <Grid item xs={12} md={5}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Idioma de destino</InputLabel>
                <Select
                  value={targetLang}
                  label="Idioma de destino"
                  onChange={(e) => setTargetLang(e.target.value)}
                >
                  {languages.map(lang => (
                    <MenuItem value={lang.code} key={lang.code}>
                      {lang.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={8}
                value={translatedText}
                InputProps={{ readOnly: true }}
                variant="outlined"
                placeholder="Traducción..."
              />

              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Tooltip title="Copiar traducción">
                  <IconButton onClick={() => copyToClipboard(translatedText)}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={translateText}
                disabled={loading || !sourceText.trim()}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Traducir'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
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

export default Translator;
