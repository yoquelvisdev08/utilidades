import React, { useState, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import GradientIcon from '@mui/icons-material/Gradient';

const gradientTypes = [
  { id: 'linear', name: 'Lineal' },
  { id: 'radial', name: 'Radial' }
];

const defaultColors = [
  { color: '#ff0000', position: 0 },
  { color: '#0000ff', position: 100 }
];

function GradientGenerator() {
  const [gradientType, setGradientType] = useState('linear');
  const [angle, setAngle] = useState(90);
  const [colors, setColors] = useState(defaultColors);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const getGradientCSS = () => {
    const colorStops = colors
      .sort((a, b) => a.position - b.position)
      .map(stop => `${stop.color} ${stop.position}%`)
      .join(', ');

    if (gradientType === 'linear') {
      return `linear-gradient(${angle}deg, ${colorStops})`;
    } else {
      return `radial-gradient(circle, ${colorStops})`;
    }
  };

  const addColor = () => {
    if (colors.length >= 5) {
      setNotification({
        open: true,
        message: 'Máximo 5 colores permitidos',
        severity: 'warning'
      });
      return;
    }

    const newPosition = Math.round((colors[colors.length - 1].position + colors[0].position) / 2);
    setColors([...colors, { color: '#ffffff', position: newPosition }]);
  };

  const removeColor = (index) => {
    if (colors.length <= 2) {
      setNotification({
        open: true,
        message: 'Mínimo 2 colores requeridos',
        severity: 'warning'
      });
      return;
    }
    setColors(colors.filter((_, i) => i !== index));
  };

  const updateColor = (index, field, value) => {
    const newColors = [...colors];
    newColors[index] = { ...newColors[index], [field]: value };
    setColors(newColors);
  };

  const copyToClipboard = () => {
    const css = getGradientCSS();
    navigator.clipboard.writeText(css);
    setNotification({
      open: true,
      message: 'CSS copiado al portapapeles',
      severity: 'success'
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Generador de Gradientes
            </Typography>
            <GradientIcon sx={{ fontSize: 30 }} />
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Gradiente</InputLabel>
                  <Select
                    value={gradientType}
                    label="Tipo de Gradiente"
                    onChange={(e) => setGradientType(e.target.value)}
                  >
                    {gradientTypes.map(type => (
                      <MenuItem value={type.id} key={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {gradientType === 'linear' && (
                <Box sx={{ mb: 3 }}>
                  <Typography gutterBottom>Ángulo: {angle}°</Typography>
                  <Slider
                    value={angle}
                    onChange={(e, value) => setAngle(value)}
                    min={0}
                    max={360}
                    valueLabelDisplay="auto"
                  />
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2">
                    Colores ({colors.length}/5)
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addColor}
                    disabled={colors.length >= 5}
                  >
                    Añadir Color
                  </Button>
                </Box>

                {colors.map((color, index) => (
                  <Box key={index} sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={color.color}
                      onChange={(e) => updateColor(index, 'color', e.target.value)}
                      style={{ width: 50, height: 50, padding: 0, border: 'none' }}
                    />
                    <TextField
                      type="number"
                      label="Posición %"
                      value={color.position}
                      onChange={(e) => updateColor(index, 'position', Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                      size="small"
                      sx={{ width: 100 }}
                    />
                    <IconButton
                      onClick={() => removeColor(index)}
                      disabled={colors.length <= 2}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Vista Previa
                </Typography>
                <Box
                  sx={{
                    width: '100%',
                    height: 200,
                    borderRadius: 1,
                    border: '1px solid #e0e0e0',
                    background: getGradientCSS()
                  }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  CSS
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={`background: ${getGradientCSS()};`}
                    InputProps={{ readOnly: true }}
                  />
                  <Tooltip title="Copiar CSS">
                    <IconButton onClick={copyToClipboard}>
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
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

export default GradientGenerator;
