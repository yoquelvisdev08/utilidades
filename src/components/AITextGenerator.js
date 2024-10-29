import React, { useState } from 'react';
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
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Slider,
  Divider,
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
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import TuneIcon from '@mui/icons-material/Tune';
import InfoIcon from '@mui/icons-material/Info';

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
  },
  story: {
    name: 'Historia',
    description: 'Crea historias creativas y entretenidas',
    examples: [
      'Historia corta de ciencia ficción',
      'Cuento infantil sobre la amistad',
      'Historia de misterio en una casa antigua'
    ]
  },
  social: {
    name: 'Redes Sociales',
    description: 'Contenido optimizado para redes sociales',
    examples: [
      'Post de LinkedIn sobre liderazgo',
      'Tweet viral sobre tecnología',
      'Descripción de Instagram para una foto de viaje'
    ]
  },
  script: {
    name: 'Guión',
    description: 'Guiones para videos, podcasts o presentaciones',
    examples: [
      'Guión para un video tutorial de 5 minutos',
      'Introducción para un podcast de tecnología',
      'Presentación sobre innovación empresarial'
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

function AITextGenerator() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('general');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [savedResults, setSavedResults] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [settings, setSettings] = useState({
    tone: 'Profesional',
    length: 500,
    creativity: 0.7
  });

  const generateText = async () => {
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
      // Aquí iría la integración real con una API de IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedText = `Texto generado basado en tu prompt: "${prompt}"\n\n` +
        `Usando el tipo: ${contentTypes[type].name}\n` +
        `Tono: ${settings.tone}\n` +
        `Longitud aproximada: ${settings.length} palabras\n` +
        `Nivel de creatividad: ${settings.creativity * 100}%\n\n` +
        'Lorem ipsum dolor sit amet...';

      setResult(generatedText);
      
      // Guardar en historial
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
      setNotification({
        open: true,
        message: 'Error al generar el texto',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setNotification({
      open: true,
      message: 'Texto copiado al portapapeles',
      severity: 'success'
    });
  };

  const handleDelete = (id) => {
    setSavedResults(prev => prev.filter(item => item.id !== id));
  };

  const handleLoadSaved = (saved) => {
    setPrompt(saved.prompt);
    setResult(saved.result);
    setType(saved.type);
    setSettings(saved.settings);
    setShowHistory(false);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
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
                      onChange={(e) => setSettings({ ...settings, tone: e.target.value })}
                    >
                      {tones.map(tone => (
                        <MenuItem value={tone} key={tone}>{tone}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography gutterBottom>
                    Longitud aproximada (palabras): {settings.length}
                  </Typography>
                  <Slider
                    value={settings.length}
                    onChange={(e, newValue) => setSettings({ ...settings, length: newValue })}
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

                <Grid item xs={12}>
                  <Typography gutterBottom>
                    Nivel de Creatividad: {(settings.creativity * 100).toFixed(0)}%
                  </Typography>
                  <Slider
                    value={settings.creativity}
                    onChange={(e, newValue) => setSettings({ ...settings, creativity: newValue })}
                    min={0}
                    max={1}
                    step={0.1}
                    marks={[
                      { value: 0, label: 'Conservador' },
                      { value: 0.5, label: 'Balanceado' },
                      { value: 1, label: 'Creativo' }
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

      <Grid item xs={12} md={4}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Consejos para Mejores Resultados
          </Typography>
          
          <List>
            <ListItem>
              <ListItemText
                primary="Sé específico"
                secondary="Cuanto más detallado sea tu prompt, mejores resultados obtendrás"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Usa el tipo correcto"
                secondary="Selecciona el tipo de contenido que mejor se ajuste a tus necesidades"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Ajusta la creatividad"
                secondary="Un nivel más alto de creatividad puede generar resultados más únicos"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Experimenta con el tono"
                secondary="El tono puede cambiar significativamente el resultado final"
              />
            </ListItem>
          </List>
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
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {item.prompt.slice(0, 50)}...
                        </Typography>
                        <Chip
                          label={contentTypes[item.type].name}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="caption" display="block">
                          {new Date(item.timestamp).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Tono: {item.settings.tone}, 
                          Longitud: {item.settings.length} palabras
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
