import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Grid,
  TextField,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import CompareIcon from '@mui/icons-material/Compare';
import { imageSettings, validateImage, convertImage } from '../../services/converters/imageConverter';

function ImageConverter() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [targetFormat, setTargetFormat] = useState('');
  const [settings, setSettings] = useState({
    quality: imageSettings.quality.default,
    resize: {
      maxWidth: null,
      maxHeight: null
    }
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [previews, setPreviews] = useState({});

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    const validFiles = [];
    const newPreviews = {};

    for (const file of files) {
      try {
        if (!file.type.startsWith('image/')) {
          throw new Error('Archivo no es una imagen');
        }

        const imageInfo = await validateImage(file);
        validFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          info: imageInfo
        });

        newPreviews[file.name] = URL.createObjectURL(file);
      } catch (error) {
        setNotification({
          open: true,
          message: `Error al procesar ${file.name}: ${error.message}`,
          severity: 'error'
        });
      }
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviews(prev => ({ ...prev, ...newPreviews }));
  };

  const handleConvert = async (fileObj) => {
    if (!targetFormat) {
      setNotification({
        open: true,
        message: 'Selecciona un formato de salida',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await convertImage(fileObj.file, targetFormat, settings);
      
      setConvertedFiles(prev => [...prev, {
        id: fileObj.id,
        original: fileObj.file,
        converted: result.file,
        info: result.info
      }]);

      setNotification({
        open: true,
        message: 'Imagen convertida exitosamente',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: error.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConvertAll = async () => {
    if (!targetFormat) {
      setNotification({
        open: true,
        message: 'Selecciona un formato de salida',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    for (const fileObj of selectedFiles) {
      if (!convertedFiles.find(cf => cf.id === fileObj.id)) {
        await handleConvert(fileObj);
      }
    }
    setLoading(false);
  };

  const handleDownload = (convertedFile) => {
    const url = URL.createObjectURL(convertedFile.converted);
    const link = document.createElement('a');
    link.href = url;
    link.download = convertedFile.converted.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRemoveFile = (fileObj) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileObj.id));
    setConvertedFiles(prev => prev.filter(f => f.id !== fileObj.id));
    URL.revokeObjectURL(previews[fileObj.file.name]);
    setPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[fileObj.file.name];
      return newPreviews;
    });
  };

  useEffect(() => {
    return () => {
      // Limpiar URLs al desmontar
      Object.values(previews).forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Convertidor de Imágenes
          </Typography>
          
          <Box sx={{ mb: 3 }}>
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
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Formato de Salida
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(imageSettings.formats.output).map(([format, info]) => (
                    <Chip
                      key={format}
                      label={info.name}
                      onClick={() => setTargetFormat(format)}
                      color={targetFormat === format ? "primary" : "default"}
                      variant={targetFormat === format ? "filled" : "outlined"}
                    />
                  ))}
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Configuración
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography gutterBottom>
                      Calidad: {settings.quality}%
                    </Typography>
                    <Slider
                      value={settings.quality}
                      onChange={(e, value) => setSettings(prev => ({ ...prev, quality: value }))}
                      min={imageSettings.quality.min}
                      max={imageSettings.quality.max}
                      step={imageSettings.quality.step}
                    />
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Ancho Máx."
                        value={settings.resize.maxWidth || ''}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          resize: {
                            ...prev.resize,
                            maxWidth: e.target.value ? Number(e.target.value) : null
                          }
                        }))}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Alto Máx."
                        value={settings.resize.maxHeight || ''}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          resize: {
                            ...prev.resize,
                            maxHeight: e.target.value ? Number(e.target.value) : null
                          }
                        }))}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              {selectedFiles.map((fileObj) => {
                const convertedFile = convertedFiles.find(cf => cf.id === fileObj.id);
                return (
                  <Paper
                    key={fileObj.id}
                    variant="outlined"
                    sx={{ p: 2, mb: 2 }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Original
                        </Typography>
                        <img
                          src={previews[fileObj.file.name]}
                          alt="Original"
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'contain'
                          }}
                        />
                        <Typography variant="caption" display="block">
                          {fileObj.file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Convertida
                        </Typography>
                        {convertedFile ? (
                          <>
                            <img
                              src={URL.createObjectURL(convertedFile.converted)}
                              alt="Convertida"
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'contain'
                              }}
                            />
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" display="block">
                                {convertedFile.converted.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {(convertedFile.info.convertedSize / 1024 / 1024).toFixed(2)} MB
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Button
                                  size="small"
                                  startIcon={<DownloadIcon />}
                                  onClick={() => handleDownload(convertedFile)}
                                >
                                  Descargar
                                </Button>
                              </Box>
                            </Box>
                          </>
                        ) : (
                          <Box
                            sx={{
                              height: '200px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: '#f5f5f5'
                            }}
                          >
                            {loading ? (
                              <CircularProgress />
                            ) : (
                              <Button
                                onClick={() => handleConvert(fileObj)}
                                disabled={!targetFormat}
                              >
                                Convertir
                              </Button>
                            )}
                          </Box>
                        )}
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFile(fileObj)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                );
              })}

              {selectedFiles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleConvertAll}
                    disabled={loading || !targetFormat}
                    fullWidth
                  >
                    {loading ? <CircularProgress size={24} /> : 'Convertir Todo'}
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
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
