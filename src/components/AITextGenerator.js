import React, { useState, useEffect, useCallback } from 'react';
import { 
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import TuneIcon from '@mui/icons-material/Tune';

const API_URL = 'http://localhost:3001/api';

const contentTypes = {
  general: {
    name: 'Texto General',
    description: 'Genera cualquier tipo de texto basado en tu prompt',
    examples: [
      'Escribe un resumen sobre la inteligencia artificial',
      'Genera una descripción de un paisaje tropical',
      'Crea una explicación sobre cómo funciona la fotosíntesis'
    ]
  },
  email: {
    name: 'Correo Electrónico',
    description: 'Genera correos electrónicos profesionales o personales',
    examples: [
      'Correo de solicitud de trabajo para una posición de desarrollador',
      'Correo de seguimiento después de una reunión de negocios',
      'Correo de agradecimiento a un cliente'
    ]
  },
  article: {
    name: 'Artículo',
    description: 'Genera artículos bien estructurados sobre cualquier tema',
    examples: [
      'Artículo sobre los beneficios del ejercicio',
      'Artículo técnico sobre desarrollo web',
      'Artículo de opinión sobre el cambio climático'
    ]
  }
};

const tones = [
  'Profesional',
  'Casual',
  'Formal',
  'Amigable',
  'Técnico',
  'Persuasivo',
  'Informativo',
  'Creativo'
];

const initialSettings = {
  tone: 'Profesional',
  temperature: 0.7,
  max_tokens: 500
};

function AITextGenerator() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('general');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [savedResults, setSavedResults] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [settings, setSettings] = useState(initialSettings);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  const waitForResult = useCallback(async (predictionId) => {
    const maxAttempts = 20;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`${API_URL}/generate/${predictionId}`);
        if (!response.ok) throw new Error("Error al obtener el resultado");

        const prediction = await response.json();
        if (prediction.status === "succeeded") return prediction.output;
        if (prediction.status === "failed") throw new Error("La generación de texto falló");

        attempts += 1;
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error en waitForResult:', error);
        throw error;
      }
    }
    throw new Error("Tiempo de espera agotado");
  }, []);

  const generateText = useCallback(async () => {
    if (!prompt.trim()) {
      setNotification({
        open: true,
        message: 'Por favor ingresa un prompt',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const enhancedPrompt = `
        [INSTRUCCIÓN]
        Actúa como un asistente experto en generar ${contentTypes[type].name.toLowerCase()}.
        Usa un tono ${settings.tone.toLowerCase()}.
        
        [CONTEXTO]
        Tipo de contenido: ${contentTypes[type].name}
        Tono deseado: ${settings.tone}
        
        [TAREA]
        ${prompt}
      `;

      const response = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          temperature: settings.temperature,
          max_tokens: settings.max_tokens,
          top_p: 0.9
        }),
      });

      if (!response.ok) {
        throw new Error('Error al conectar con el servicio de IA');
      }

      const prediction = await response.json();
      const generatedText = await waitForResult(prediction.id);
      
      setResult(generatedText);
      setSavedResults(prev => [{
        id: Date.now(),
        prompt,
        result: generatedText,
        type,
        settings: { ...settings },
        timestamp: new Date().toISOString()
      }, ...prev]);

      setNotification({
        open: true,
        message: 'Texto generado exitosamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error en generateText:', error);
      setNotification({
        open: true,
        message: error.message || 'Error al generar el texto',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [prompt, type, settings, waitForResult]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(result);
    setNotification({
      open: true,
      message: 'Texto copiado al portapapeles',
      severity: 'success'
    });
  }, [result]);

  const handleDelete = useCallback((id) => {
    setSavedResults(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleLoadSaved = useCallback((saved) => {
    setPrompt(saved.prompt);
    setResult(saved.result);
    setType(saved.type);
    setSettings(saved.settings);
    setShowHistory(false);
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup function
      setResult('');
      setLoading(false);
      setNotification({ open: false, message: '', severity: 'info' });
    };
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            Generador de Texto con LLaMA 2
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Contenido</InputLabel>
              <Select
                value={type}
                label="Tipo de Contenido"
                onChange={(e) => setType(e.target.value)}
              >
                {Object.entries(contentTypes).map(([key, value]) => (
                  <MenuItem value={key} key={key}>
                    <Box>
                      <Typography variant="subtitle2">{value.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {value.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Describe lo que quieres generar"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={contentTypes[type].examples[0]}
          />

          <Box sx={{ mt: 2, mb: 3 }}>
            <Button
              variant="text"
              size="small"
              onClick={() => setShowExamples(!showExamples)}
              endIcon={<ExpandMoreIcon />}
            >
              Ver ejemplos
            </Button>
          </Box>

          {showExamples && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Ejemplos para {contentTypes[type].name}:
              </Typography>
              <List dense>
                {contentTypes[type].examples.map((example, index) => (
                  <ListItem key={index} sx={{ pl: 0 }}>
                    <ListItemText
                      primary={example}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => setPrompt(example)}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TuneIcon />
                <Typography>Configuración Avanzada</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Tono</InputLabel>
                    <Select
                      value={settings.tone}
                      label="Tono"
                      onChange={(e) => setSettings(prev => ({ ...prev, tone: e.target.value }))}
                    >
                      {tones.map(tone => (
                        <MenuItem value={tone} key={tone}>{tone}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography gutterBottom>
                    Creatividad: {(settings.temperature * 100).toFixed(0)}%
                  </Typography>
                  <Slider
                    value={settings.temperature}
                    onChange={(e, newValue) => setSettings(prev => ({ ...prev, temperature: newValue }))}
                    min={0}
                    max={1}
                    step={0.1}
                    marks={[
                      { value: 0, label: 'Preciso' },
                      { value: 0.5, label: 'Balanceado' },
                      { value: 1, label: 'Creativo' }
                    ]}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography gutterBottom>
                    Longitud máxima: {settings.max_tokens} tokens
                  </Typography>
                  <Slider
                    value={settings.max_tokens}
                    onChange={(e, newValue) => setSettings(prev => ({ ...prev, max_tokens: newValue }))}
                    min={100}
                    max={2000}
                    step={100}
                    marks={[
                      { value: 100, label: '100' },
                      { value: 1000, label: '1000' },
                      { value: 2000, label: '2000' }
                    ]}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={generateText}
              disabled={loading || !prompt.trim()}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Generar Texto'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowHistory(true)}
              startIcon={<HistoryIcon />}
            >
              Historial
            </Button>
          </Box>

          {result && (
            <Box sx={{ mt: 3 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Tooltip title="Copiar">
                    <IconButton onClick={handleCopy}>
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography
                  sx={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}
                >
                  {result}
                </Typography>
              </Paper>
            </Box>
          )}
        </Paper>
      </Grid>

      <Dialog
        open={showHistory}
        onClose={() => setShowHistory(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon />
            Historial de Generaciones
          </Box>
        </DialogTitle>
        <DialogContent>
          {savedResults.length > 0 ? (
            <List>
              {savedResults.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    border: '1px solid #eee',
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  <ListItemText
                    primary={item.prompt.slice(0, 50) + '...'}
                    secondary={
                      <>
                        <Typography variant="caption" display="block">
                          {new Date(item.timestamp).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Tipo: {contentTypes[item.type].name}, 
                          Tono: {item.settings.tone}
                        </Typography>
                      </>
                    }
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleLoadSaved(item)}
                  />
                  <IconButton
                    edge="end"
                    onClick={() => handleDelete(item.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" align="center">
              No hay generaciones guardadas
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

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

export default AITextGenerator;
