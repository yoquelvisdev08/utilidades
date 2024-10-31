import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Slider,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import FileUploader from '../FileUploader';
import { convertImage, imageSettings } from '../../services/converters/imageConverter';

const supportedFormats = ['jpg', 'png', 'gif', 'webp'];

function ImageConverter() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [previews, setPreviews] = useState({});
  const [settings, setSettings] = useState({
    quality: 90,
    resize: {
      maxWidth: null,
      maxHeight: null
    }
  });
  const [targetFormat, setTargetFormat] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleFileSelect = (files) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length > 0) {
      const newFiles = validFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file
      }));
      
      setSelectedFiles(prev => [...prev, ...newFiles]);
      
      // Create previews for all files
      validFiles.forEach(file => {
        const previewUrl = URL.createObjectURL(file);
        setPreviews(prev => ({
          ...prev,
          [file.name]: previewUrl
        }));
      });
    } else {
      setNotification({
        open: true,
        message: 'Por favor selecciona archivos de imagen válidos',
        severity: 'error'
      });
    }
  };

  const handleConvert = async () => {
    if (!selectedFiles.length || !targetFormat) {
      setNotification({
        open: true,
        message: 'Por favor selecciona un archivo y formato de destino',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      const converted = await Promise.all(
        selectedFiles.map(async (fileObj) => {
          const result = await convertImage(fileObj.file, targetFormat, settings);
          return {
            id: fileObj.id,
            ...result
          };
        })
      );

      setConvertedFiles(converted);
      setNotification({
        open: true,
        message: 'Imágenes convertidas exitosamente',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: `Error al convertir las imágenes: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleRemoveFile = (fileObj) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileObj.id));
    URL.revokeObjectURL(previews[fileObj.file.name]);
    setPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[fileObj.file.name];
      return newPreviews;
    });
  };

  const handleDownload = (convertedFile) => {
    const url = URL.createObjectURL(convertedFile.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = convertedFile.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Convertidor de Imágenes
          </Typography>

          <FileUploader
            onFileSelect={handleFileSelect}
            accept="image/*"
          />

          {Object.keys(previews).length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Imágenes seleccionadas:
              </Typography>
              <Grid container spacing={2}>
                {selectedFiles.map((fileObj) => (
                  <Grid item xs={12} sm={6} md={4} key={fileObj.id}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 1, 
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        position: 'relative'
                      }}
                    >
                      <img
                        src={previews[fileObj.file.name]}
                        alt={fileObj.file.name}
                        style={{
                          width: '100%',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" noWrap>
                          {fileObj.file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(fileObj.file.size / 1024).toFixed(1)} KB
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFile(fileObj)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.7)'
                          }
                        }}
                      >
                        <DeleteIcon sx={{ color: 'white' }} />
                      </IconButton>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {convertedFiles.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Imágenes convertidas:
              </Typography>
              <Grid container spacing={2}>
                {convertedFiles.map((convertedFile) => (
                  <Grid item xs={12} sm={6} md={4} key={convertedFile.id}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 1, 
                        border: '1px solid #e0e0e0',
                        borderRadius: 1
                      }}
                    >
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" noWrap>
                          {convertedFile.file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {(convertedFile.info.convertedSize / 1024).toFixed(1)} KB
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {convertedFile.info.width}x{convertedFile.info.height}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownload(convertedFile)}
                        fullWidth
                      >
                        Descargar
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Configuración
          </Typography>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Formato de Salida</InputLabel>
            <Select
              value={targetFormat}
              label="Formato de Salida"
              onChange={(e) => setTargetFormat(e.target.value)}
            >
              {supportedFormats.map(format => (
                <MenuItem value={format} key={format}>
                  {format.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>
              Calidad: {settings.quality}%
            </Typography>
            <Slider
              value={settings.quality}
              onChange={(e, value) => setSettings(prev => ({ ...prev, quality: value }))}
              min={1}
              max={100}
              marks={[
                { value: 1, label: '1%' },
                { value: 50, label: '50%' },
                { value: 100, label: '100%' }
              ]}
            />
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={handleConvert}
            disabled={!selectedFiles.length || !targetFormat || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Convertir'}
          </Button>
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

export default ImageConverter;
