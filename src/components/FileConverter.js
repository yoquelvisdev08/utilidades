import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Backdrop,
  Grid,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import FileUploader from './FileUploader';
import ConversionOptions from './ConversionOptions';
import { convertFile, downloadFile } from '../services/converter';

const supportedFormats = {
  image: ['jpg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg'],
  document: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'html', 'md'],
  audio: ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'],
  video: ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz']
};

function FileConverter() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [targetFormat, setTargetFormat] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [advancedSettings, setAdvancedSettings] = useState({
    quality: 90,
    resolution: '1920x1080',
    compression: 'medium'
  });
  const [conversionHistory, setConversionHistory] = useState([]);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileSelect = (files) => {
    const newFiles = Array.from(files).map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9)
    }));
    setSelectedFiles([...selectedFiles, ...newFiles]);
    
    // Generar preview para el primer archivo si es imagen
    if (files[0]?.type.startsWith('image/')) {
      const url = URL.createObjectURL(files[0]);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = (fileId) => {
    setSelectedFiles(selectedFiles.filter(f => f.id !== fileId));
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
  };

  const handleFormatSelect = (format) => {
    setTargetFormat(format);
  };

  const handleSettingChange = (setting, value) => {
    setAdvancedSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleConversion = async () => {
    if (selectedFiles.length === 0 || !targetFormat) return;

    setLoading(true);
    try {
      for (const fileObj of selectedFiles) {
        const convertedFile = await convertFile(fileObj.file, targetFormat, advancedSettings);
        downloadFile(convertedFile);
        
        // Agregar a historial
        setConversionHistory(prev => [{
          originalName: fileObj.file.name,
          targetFormat,
          timestamp: new Date().toISOString(),
          success: true
        }, ...prev]);
      }
      
      setNotification({
        open: true,
        message: 'Archivos convertidos y descargados exitosamente',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Error al convertir los archivos. Por favor, intenta de nuevo.',
        severity: 'error'
      });
      
      // Agregar error al historial
      setConversionHistory(prev => [{
        originalName: selectedFiles[0].file.name,
        targetFormat,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const clearHistory = () => {
    setConversionHistory([]);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Archivos Seleccionados
          </Typography>
          
          <FileUploader 
            onFileSelect={handleFileSelect} 
            multiple
            accept="*/*"
          />

          {selectedFiles.length > 0 && (
            <List sx={{ mt: 2 }}>
              {selectedFiles.map((fileObj) => (
                <ListItem key={fileObj.id}>
                  <ListItemText 
                    primary={fileObj.file.name}
                    secondary={`${(fileObj.file.size / 1024 / 1024).toFixed(2)} MB`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleRemoveFile(fileObj.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}

          {previewUrl && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <img 
                src={previewUrl} 
                alt="Preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '300px',
                  borderRadius: '8px'
                }} 
              />
            </Box>
          )}

          <Accordion sx={{ mt: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon />
                <Typography>Configuración Avanzada</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Calidad"
                    value={advancedSettings.quality}
                    onChange={(e) => handleSettingChange('quality', e.target.value)}
                    InputProps={{ inputProps: { min: 1, max: 100 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Resolución"
                    value={advancedSettings.resolution}
                    onChange={(e) => handleSettingChange('resolution', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Compresión</InputLabel>
                    <Select
                      value={advancedSettings.compression}
                      label="Compresión"
                      onChange={(e) => handleSettingChange('compression', e.target.value)}
                    >
                      <MenuItem value="low">Baja</MenuItem>
                      <MenuItem value="medium">Media</MenuItem>
                      <MenuItem value="high">Alta</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Formato de Salida
          </Typography>
          
          {Object.entries(supportedFormats).map(([category, formats]) => (
            <Box key={category} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {category.toUpperCase()}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formats.map((format) => (
                  <Chip
                    key={format}
                    label={format}
                    onClick={() => handleFormatSelect(format)}
                    color={targetFormat === format ? "primary" : "default"}
                    variant={targetFormat === format ? "filled" : "outlined"}
                  />
                ))}
              </Box>
            </Box>
          ))}

          <Button
            variant="contained"
            fullWidth
            onClick={handleConversion}
            disabled={selectedFiles.length === 0 || !targetFormat || loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Convertir'}
          </Button>
        </Paper>

        {conversionHistory.length > 0 && (
          <Paper elevation={0} sx={{ p: 3, mt: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon />
                <Typography variant="h6">Historial</Typography>
              </Box>
              <Button size="small" onClick={clearHistory}>
                Limpiar
              </Button>
            </Box>
            
            <List dense>
              {conversionHistory.slice(0, 5).map((item, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={item.originalName}
                    secondary={`${item.targetFormat} - ${new Date(item.timestamp).toLocaleString()}`}
                  />
                  <Chip
                    size="small"
                    label={item.success ? "Éxito" : "Error"}
                    color={item.success ? "success" : "error"}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Grid>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography sx={{ mt: 2, color: 'white' }}>
            Convirtiendo archivos...
          </Typography>
        </Box>
      </Backdrop>

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

export default FileConverter;
