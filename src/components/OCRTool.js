import React, { useState, useCallback } from 'react';
import { 
  Paper,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Box,
  TextField,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Divider,
  LinearProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import HistoryIcon from '@mui/icons-material/History';
import EditIcon from '@mui/icons-material/Edit';
import { createWorker } from 'tesseract.js';

const languages = [
  { code: 'spa', name: 'Español' },
  { code: 'eng', name: 'Inglés' },
  { code: 'fra', name: 'Francés' },
  { code: 'deu', name: 'Alemán' },
  { code: 'ita', name: 'Italiano' },
  { code: 'por', name: 'Portugués' },
  { code: 'rus', name: 'Ruso' },
  { code: 'chi_sim', name: 'Chino Simplificado' },
  { code: 'jpn', name: 'Japonés' },
  { code: 'kor', name: 'Coreano' }
];

function OCRTool() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [extractedTexts, setExtractedTexts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('spa');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [editingText, setEditingText] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileSelect = useCallback((event) => {
    const files = Array.from(event.target.files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file)
    }));

    setSelectedFiles(prev => [...prev, ...files]);
  }, []);

  const extractText = async (file) => {
    setLoading(true);
    setProgress(0);
    
    try {
      const worker = await createWorker({
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });

      await worker.loadLanguage(language);
      await worker.initialize(language);
      
      const { data: { text, confidence } } = await worker.recognize(file.preview);
      await worker.terminate();

      const extractedText = {
        id: file.id,
        fileName: file.file.name,
        content: text,
        language,
        timestamp: new Date().toISOString(),
        confidence
      };

      setExtractedTexts(prev => [...prev, extractedText]);
      setHistory(prev => [extractedText, ...prev]);

      setNotification({
        open: true,
        message: 'Texto extraído exitosamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error en OCR:', error);
      setNotification({
        open: true,
        message: `Error al extraer el texto: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleExtractAll = useCallback(async () => {
    for (const file of selectedFiles) {
      if (!extractedTexts.some(text => text.id === file.id)) {
        await extractText(file);
      }
    }
  }, [selectedFiles, extractedTexts]);

  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text.content);
    setNotification({
      open: true,
      message: 'Texto copiado al portapapeles',
      severity: 'success'
    });
  }, []);

  const handleDownload = useCallback((text) => {
    const blob = new Blob([text.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OCR-${text.fileName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleDelete = useCallback((id) => {
    setSelectedFiles(prev => {
      const newFiles = prev.filter(f => f.id !== id);
      const file = prev.find(f => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return newFiles;
    });
    setExtractedTexts(prev => prev.filter(text => text.id !== id));
  }, []);

  const handleEdit = useCallback((text) => {
    setEditingText(text);
    setEditedContent(text.content);
    setEditDialog(true);
  }, []);

  const handleSaveEdit = useCallback(() => {
    setExtractedTexts(prev =>
      prev.map(text =>
        text.id === editingText.id
          ? { ...text, content: editedContent }
          : text
      )
    );
    setEditDialog(false);
  }, [editingText, editedContent]);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Button
                  variant="contained"
                  component="label"
                >
                  Seleccionar Imágenes
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </Button>
              </Grid>
              {selectedFiles.length > 0 && (
                <Grid item>
                  <Button
                    variant="outlined"
                    onClick={handleExtractAll}
                    disabled={loading}
                  >
                    Extraer Todo
                  </Button>
                </Grid>
              )}
              <Grid item xs>
                <FormControl fullWidth size="small">
                  <InputLabel>Idioma</InputLabel>
                  <Select
                    value={language}
                    label="Idioma"
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    {languages.map(lang => (
                      <MenuItem value={lang.code} key={lang.code}>
                        {lang.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {selectedFiles.map((file) => (
            <Box
              key={file.id}
              sx={{
                mb: 3,
                p: 2,
                border: '1px solid #eee',
                borderRadius: 2
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Imagen Original
                  </Typography>
                  <img
                    src={file.preview}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'contain',
                      borderRadius: '4px'
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Texto Extraído
                  </Typography>
                  {extractedTexts.find(text => text.id === file.id) ? (
                    <Box>
                      <TextField
                        fullWidth
                        multiline
                        rows={8}
                        value={extractedTexts.find(text => text.id === file.id).content}
                        InputProps={{ readOnly: true }}
                      />
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<ContentCopyIcon />}
                          onClick={() => handleCopy(extractedTexts.find(text => text.id === file.id))}
                        >
                          Copiar
                        </Button>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEdit(extractedTexts.find(text => text.id === file.id))}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownload(extractedTexts.find(text => text.id === file.id))}
                        >
                          Descargar
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        height: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#f5f5f5',
                        borderRadius: 1
                      }}
                    >
                      {loading ? (
                        <>
                          <CircularProgress />
                          <Box sx={{ width: '100%', mt: 2 }}>
                            <LinearProgress variant="determinate" value={progress} />
                            <Typography variant="caption" align="center" display="block">
                              {progress.toFixed(1)}%
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        <Button
                          onClick={() => extractText(file)}
                        >
                          Extraer Texto
                        </Button>
                      )}
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {file.file.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(file.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ))}
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Historial</Typography>
            <IconButton onClick={() => setShowHistory(true)}>
              <HistoryIcon />
            </IconButton>
          </Box>

          <List>
            {history.slice(0, 5).map((item) => (
              <ListItem
                key={item.id}
                sx={{
                  border: '1px solid #eee',
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <ListItemText
                  primary={item.fileName}
                  secondary={
                    <>
                      <Typography variant="caption" display="block">
                        {new Date(item.timestamp).toLocaleString()}
                      </Typography>
                      <Chip
                        size="small"
                        label={`Confianza: ${item.confidence.toFixed(1)}%`}
                        color={item.confidence > 90 ? "success" : "warning"}
                      />
                    </>
                  }
                />
                <IconButton
                  edge="end"
                  onClick={() => handleCopy(item)}
                >
                  <ContentCopyIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Editar Texto Extraído</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showHistory}
        onClose={() => setShowHistory(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon />
            Historial Completo
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {history.map((item) => (
              <ListItem
                key={item.id}
                sx={{
                  border: '1px solid #eee',
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <ListItemText
                  primary={item.fileName}
                  secondary={
                    <>
                      <Typography variant="caption" display="block">
                        {new Date(item.timestamp).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.content.slice(0, 100)}...
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          size="small"
                          label={`Idioma: ${languages.find(l => l.code === item.language)?.name}`}
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          size="small"
                          label={`Confianza: ${item.confidence.toFixed(1)}%`}
                          color={item.confidence > 90 ? "success" : "warning"}
                        />
                      </Box>
                    </>
                  }
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleCopy(item)}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDownload(item)}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
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

export default OCRTool;
