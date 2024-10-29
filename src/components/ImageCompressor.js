import React, { useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Button,
  Grid,
  Slider,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  FormControlLabel,
  Switch,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import CompareIcon from '@mui/icons-material/Compare';
import InfoIcon from '@mui/icons-material/Info';

function ImageCompressor() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [compressedFiles, setCompressedFiles] = useState([]);
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [preserveExif, setPreserveExif] = useState(true);
  const [autoCompress, setAutoCompress] = useState(true);
  const [comparing, setComparing] = useState(false);
  const canvasRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      original: file,
      originalSize: file.size,
      preview: URL.createObjectURL(file),
      compressed: null,
      compressedSize: null,
      status: 'pending'
    }));

    setSelectedFiles(prev => [...prev, ...files]);

    if (autoCompress) {
      files.forEach(file => compressImage(file));
    }
  };

  const compressImage = async (fileObj) => {
    if (!fileObj.original) return;

    setLoading(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo el aspect ratio
        let newWidth = img.width;
        let newHeight = img.height;
        
        if (newWidth > maxWidth) {
          newHeight = (maxWidth * newHeight) / newWidth;
          newWidth = maxWidth;
        }
        
        if (newHeight > maxHeight) {
          newWidth = (maxHeight * newWidth) / newHeight;
          newHeight = maxHeight;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], fileObj.original.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });

            setSelectedFiles(prev => prev.map(f => 
              f.id === fileObj.id 
                ? {
                    ...f,
                    compressed: compressedFile,
                    compressedSize: blob.size,
                    compressedPreview: URL.createObjectURL(blob),
                    status: 'completed',
                    savings: ((fileObj.originalSize - blob.size) / fileObj.originalSize * 100).toFixed(1)
                  }
                : f
            ));

            setLoading(false);
          },
          'image/jpeg',
          quality / 100
        );
      };

      img.src = fileObj.preview;
    } catch (error) {
      setNotification({
        open: true,
        message: `Error al comprimir ${fileObj.original.name}`,
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleCompressAll = () => {
    selectedFiles.forEach(file => {
      if (file.status === 'pending') {
        compressImage(file);
      }
    });
  };

  const handleDownload = (file) => {
    if (!file.compressed) return;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(file.compressed);
    link.download = `compressed_${file.original.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    selectedFiles.forEach(file => {
      if (file.compressed) {
        handleDownload(file);
      }
    });
  };

  const handleRemove = (fileId) => {
    setSelectedFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId);
      // Limpiar URLs
      const file = prev.find(f => f.id === fileId);
      if (file) {
        URL.revokeObjectURL(file.preview);
        if (file.compressedPreview) {
          URL.revokeObjectURL(file.compressedPreview);
        }
      }
      return newFiles;
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const getTotalSavings = () => {
    const totalOriginal = selectedFiles.reduce((acc, file) => acc + file.originalSize, 0);
    const totalCompressed = selectedFiles.reduce((acc, file) => acc + (file.compressedSize || file.originalSize), 0);
    return ((totalOriginal - totalCompressed) / totalOriginal * 100).toFixed(1);
  };

  return (
    <Grid container spacing={3}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <Grid item xs={12} md={8}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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
            {selectedFiles.length > 0 && (
              <>
                <Button
                  variant="outlined"
                  onClick={handleCompressAll}
                  disabled={loading}
                >
                  Comprimir Todo
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleDownloadAll}
                  disabled={loading || selectedFiles.some(f => !f.compressed)}
                  startIcon={<DownloadIcon />}
                >
                  Descargar Todo
                </Button>
              </>
            )}
          </Box>

          <List>
            {selectedFiles.map((file) => (
              <ListItem key={file.id} sx={{ border: '1px solid #eee', borderRadius: 1, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Original
                    </Typography>
                    <img
                      src={file.preview}
                      alt="Original"
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'contain',
                        borderRadius: '4px'
                      }}
                    />
                    <Typography variant="caption" display="block">
                      {(file.originalSize / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Comprimida
                    </Typography>
                    {file.compressed ? (
                      <>
                        <img
                          src={file.compressedPreview}
                          alt="Compressed"
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'contain',
                            borderRadius: '4px'
                          }}
                        />
                        <Typography variant="caption" display="block">
                          {(file.compressedSize / 1024 / 1024).toFixed(2)} MB
                          {' '}
                          <Chip
                            size="small"
                            label={`${file.savings}% reducción`}
                            color="success"
                          />
                        </Typography>
                      </>
                    ) : (
                      <Box
                        sx={{
                          height: '200px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#f5f5f5',
                          borderRadius: 1
                        }}
                      >
                        {loading ? (
                          <CircularProgress />
                        ) : (
                          <Typography color="text.secondary">
                            Pendiente de compresión
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {file.compressed && (
                        <Button
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownload(file)}
                        >
                          Descargar
                        </Button>
                      )}
                      {!file.compressed && (
                        <Button
                          size="small"
                          onClick={() => compressImage(file)}
                          disabled={loading}
                        >
                          Comprimir
                        </Button>
                      )}
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleRemove(file.id)}
                      >
                        Eliminar
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Configuración
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>
              Calidad de Compresión: {quality}%
            </Typography>
            <Slider
              value={quality}
              onChange={(e, newValue) => setQuality(newValue)}
              aria-labelledby="quality-slider"
              valueLabelDisplay="auto"
              step={5}
              marks
              min={5}
              max={100}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Dimensiones Máximas
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Ancho Máx."
                value={maxWidth}
                onChange={(e) => setMaxWidth(Number(e.target.value))}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Alto Máx."
                value={maxHeight}
                onChange={(e) => setMaxHeight(Number(e.target.value))}
                size="small"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={preserveExif}
                  onChange={(e) => setPreserveExif(e.target.checked)}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Preservar Metadatos
                  <Tooltip title="Mantener información EXIF de la imagen">
                    <InfoIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              }
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={autoCompress}
                onChange={(e) => setAutoCompress(e.target.checked)}
              />
            }
            label="Comprimir automáticamente"
          />

          {selectedFiles.length > 0 && (
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Estadísticas
              </Typography>
              <Typography variant="body2">
                Imágenes: {selectedFiles.length}
              </Typography>
              <Typography variant="body2">
                Completadas: {selectedFiles.filter(f => f.compressed).length}
              </Typography>
              <Typography variant="body2">
                Ahorro Total: {getTotalSavings()}%
              </Typography>
            </Box>
          )}
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

export default ImageCompressor;
