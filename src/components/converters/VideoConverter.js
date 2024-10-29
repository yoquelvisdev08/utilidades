import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Grid,
  Button,
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
  LinearProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import { videoSettings, validateVideo, convertVideo } from '../../services/converters/videoConverter';

function VideoConverter() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [targetFormat, setTargetFormat] = useState('');
  const [settings, setSettings] = useState({
    quality: videoSettings.quality.default,
    resolution: videoSettings.resolution.default,
    codec: videoSettings.codec.default,
    framerate: videoSettings.framerate.default
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [progress, setProgress] = useState({});

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    const validFiles = [];

    for (const file of files) {
      try {
        const info = await validateVideo(file);
        validFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          info
        });
      } catch (error) {
        setNotification({
          open: true,
          message: `Error al procesar ${file.name}: ${error.message}`,
          severity: 'error'
        });
      }
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
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
    setProgress(prev => ({ ...prev, [fileObj.id]: 0 }));

    try {
      // Simulamos progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => ({
          ...prev,
          [fileObj.id]: Math.min((prev[fileObj.id] || 0) + 10, 90)
        }));
      }, 500);

      const result = await convertVideo(fileObj.file, targetFormat, settings);
      
      clearInterval(progressInterval);
      setProgress(prev => ({ ...prev, [fileObj.id]: 100 }));

      setConvertedFiles(prev => [...prev, {
        id: fileObj.id,
        original: fileObj.file,
        converted: result.file,
        info: result.info
      }]);

      setNotification({
        open: true,
        message: 'Video convertido exitosamente',
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
    setProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileObj.id];
      return newProgress;
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Convertidor de Video
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              component="label"
            >
              Seleccionar Videos
              <input
                type="file"
                hidden
                multiple
                accept="video/*"
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
                  {Object.entries(videoSettings.formats.output).map(([format, info]) => (
                    <Chip
                      key={format}
                      label={info.name}
                      onClick={() => setTargetFormat(format)}
                      color={targetFormat === format ? "primary" : "default"}
                      variant={targetFormat === format ? "filled" : "outlined"}
                    />
                  ))}
                </Box>

                {targetFormat && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Configuración
                    </Typography>
                    
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Calidad</InputLabel>
                      <Select
                        value={settings.quality}
                        label="Calidad"
                        onChange={(e) => setSettings(prev => ({ ...prev, quality: e.target.value }))}
                      >
                        {videoSettings.quality.options.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Resolución</InputLabel>
                      <Select
                        value={settings.resolution}
                        label="Resolución"
                        onChange={(e) => setSettings(prev => ({ ...prev, resolution: e.target.value }))}
                      >
                        {videoSettings.resolution.options.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Códec</InputLabel>
                      <Select
                        value={settings.codec}
                        label="Códec"
                        onChange={(e) => setSettings(prev => ({ ...prev, codec: e.target.value }))}
                      >
                        {videoSettings.codec.options.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel>FPS</InputLabel>
                      <Select
                        value={settings.framerate}
                        label="FPS"
                        onChange={(e) => setSettings(prev => ({ ...prev, framerate: e.target.value }))}
                      >
                        {videoSettings.framerate.options.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              {selectedFiles.map((fileObj) => {
                const convertedFile = convertedFiles.find(cf => cf.id === fileObj.id);
                const currentProgress = progress[fileObj.id] || 0;

                return (
                  <Paper
                    key={fileObj.id}
                    variant="outlined"
                    sx={{ p: 2, mb: 2 }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <VideoFileIcon color="primary" />
                          <Box>
                            <Typography variant="subtitle2">
                              {fileObj.file.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          {convertedFile ? (
                            <Button
                              size="small"
                              startIcon={<DownloadIcon />}
                              onClick={() => handleDownload(convertedFile)}
                            >
                              Descargar
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              onClick={() => handleConvert(fileObj)}
                              disabled={loading || !targetFormat}
                            >
                              {loading ? <CircularProgress size={20} /> : 'Convertir'}
                            </Button>
                          )}
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveFile(fileObj)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Grid>

                      {currentProgress > 0 && currentProgress < 100 && (
                        <Grid item xs={12}>
                          <Box sx={{ width: '100%' }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={currentProgress} 
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ mt: 0.5, display: 'block' }}
                            >
                              {currentProgress}% completado
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
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

export default VideoConverter;
