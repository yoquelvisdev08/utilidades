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
  Divider,
  TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import { documentSettings, validateDocument, convertDocument } from '../../services/converters/documentConverter';

function DocumentConverter() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [targetFormat, setTargetFormat] = useState('');
  const [settings, setSettings] = useState({
    compression: documentSettings.compression.default,
    compatibility: documentSettings.compatibility.default,
    encoding: documentSettings.encoding.default
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    const validFiles = [];

    for (const file of files) {
      try {
        const info = await validateDocument(file);
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
    try {
      const result = await convertDocument(fileObj.file, targetFormat, settings);
      
      setConvertedFiles(prev => [...prev, {
        id: fileObj.id,
        original: fileObj.file,
        converted: result.file,
        info: result.info
      }]);

      setNotification({
        open: true,
        message: 'Documento convertido exitosamente',
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
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Convertidor de Documentos
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              component="label"
            >
              Seleccionar Documentos
              <input
                type="file"
                hidden
                multiple
                accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.html,.md"
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
                  {Object.entries(documentSettings.formats.output).map(([format, info]) => (
                    <Chip
                      key={format}
                      label={info.name}
                      onClick={() => setTargetFormat(format)}
                      color={targetFormat === format ? "primary" : "default"}
                      variant={targetFormat === format ? "filled" : "outlined"}
                    />
                  ))}
                </Box>

                {targetFormat && documentSettings.formats.output[targetFormat].settings.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Configuración
                    </Typography>
                    {documentSettings.formats.output[targetFormat].settings.includes('compression') && (
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Compresión</InputLabel>
                        <Select
                          value={settings.compression}
                          label="Compresión"
                          onChange={(e) => setSettings(prev => ({ ...prev, compression: e.target.value }))}
                        >
                          {documentSettings.compression.options.map(option => (
                            <MenuItem key={option} value={option}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    {documentSettings.formats.output[targetFormat].settings.includes('compatibility') && (
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Compatibilidad</InputLabel>
                        <Select
                          value={settings.compatibility}
                          label="Compatibilidad"
                          onChange={(e) => setSettings(prev => ({ ...prev, compatibility: e.target.value }))}
                        >
                          {documentSettings.compatibility.options.map(option => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    {documentSettings.formats.output[targetFormat].settings.includes('encoding') && (
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Codificación</InputLabel>
                        <Select
                          value={settings.encoding}
                          label="Codificación"
                          onChange={(e) => setSettings(prev => ({ ...prev, encoding: e.target.value }))}
                        >
                          {documentSettings.encoding.options.map(option => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Box>
                )}
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
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DescriptionIcon color="primary" />
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

export default DocumentConverter;
