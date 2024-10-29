import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Paper,
  Grid,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Transform as TransformIcon,
  Description as FileIcon,
} from '@mui/icons-material';

const ConversionOptions = ({ file, onFormatSelect, onConvert, loading }) => {
  const [selectedFormat, setSelectedFormat] = useState('');
  const [availableFormats, setAvailableFormats] = useState([]);

  useEffect(() => {
    const fileType = file.type || '';
    const formats = getAvailableFormats(fileType);
    setAvailableFormats(formats);
    setSelectedFormat('');
  }, [file]);

  const getAvailableFormats = (fileType) => {
    const formatMap = {
      'application/pdf': ['docx', 'jpg', 'png', 'txt'],
      'image/jpeg': ['png', 'pdf', 'webp', 'gif'],
      'image/png': ['jpg', 'pdf', 'webp', 'gif'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['pdf', 'txt'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['pdf', 'csv'],
      'text/plain': ['pdf', 'docx'],
      'image/gif': ['jpg', 'png', 'webp'],
      'image/webp': ['jpg', 'png', 'gif'],
    };

    return formatMap[fileType] || ['pdf', 'jpg', 'png'];
  };

  const handleFormatChange = (event) => {
    const format = event.target.value;
    setSelectedFormat(format);
    onFormatSelect(format);
  };

  const handleConvertClick = () => {
    if (selectedFormat) {
      onConvert();
    }
  };

  return (
    <Box sx={{ mt: 4 }} className="fade-in">
      <Paper elevation={2} sx={{ p: 3, backgroundColor: 'background.paper' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" mb={2}>
              <FileIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" sx={{ wordBreak: 'break-word' }}>
                Archivo seleccionado: {file.name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`Tamaño: ${(file.size / (1024 * 1024)).toFixed(2)} MB`}
                variant="outlined"
                size="small"
              />
              <Chip
                label={`Tipo: ${file.type || 'Desconocido'}`}
                variant="outlined"
                size="small"
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Convertir a</InputLabel>
              <Select
                value={selectedFormat}
                onChange={handleFormatChange}
                label="Convertir a"
                disabled={loading}
              >
                {availableFormats.map((format) => (
                  <MenuItem key={format} value={format}>
                    {format.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <TransformIcon />}
              onClick={handleConvertClick}
              disabled={!selectedFormat || loading}
              sx={{
                height: '56px',
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'action.disabledBackground',
                },
              }}
            >
              {loading ? 'Convirtiendo...' : 'Convertir y Descargar'}
            </Button>
          </Grid>

          {selectedFormat && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" align="center">
                Tu archivo será convertido a formato {selectedFormat.toUpperCase()} y 
                se descargará automáticamente
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default ConversionOptions;
