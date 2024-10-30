import React, { useState, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Slider,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Chip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ColorLensIcon from '@mui/icons-material/ColorLens';

function ColorPicker() {
  const [color, setColor] = useState({
    r: 0,
    g: 0,
    b: 0,
    a: 1
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleColorChange = (channel, value) => {
    setColor(prev => ({
      ...prev,
      [channel]: value
    }));
  };

  const getRGBA = () => {
    const { r, g, b, a } = color;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  const getHex = () => {
    const { r, g, b } = color;
    const toHex = (n) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const copyToClipboard = (format) => {
    const value = format === 'rgba' ? getRGBA() : getHex();
    navigator.clipboard.writeText(value);
    setNotification({
      open: true,
      message: `Color ${format.toUpperCase()} copiado al portapapeles`,
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
              Selector de Color
            </Typography>
            <ColorLensIcon sx={{ fontSize: 30, color: getRGBA() }} />
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography gutterBottom>Rojo (R)</Typography>
                <Slider
                  value={color.r}
                  onChange={(e, value) => handleColorChange('r', value)}
                  min={0}
                  max={255}
                  valueLabelDisplay="auto"
                  sx={{
                    color: 'red',
                    '& .MuiSlider-thumb': {
                      backgroundColor: 'red',
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography gutterBottom>Verde (G)</Typography>
                <Slider
                  value={color.g}
                  onChange={(e, value) => handleColorChange('g', value)}
                  min={0}
                  max={255}
                  valueLabelDisplay="auto"
                  sx={{
                    color: 'green',
                    '& .MuiSlider-thumb': {
                      backgroundColor: 'green',
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography gutterBottom>Azul (B)</Typography>
                <Slider
                  value={color.b}
                  onChange={(e, value) => handleColorChange('b', value)}
                  min={0}
                  max={255}
                  valueLabelDisplay="auto"
                  sx={{
                    color: 'blue',
                    '& .MuiSlider-thumb': {
                      backgroundColor: 'blue',
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography gutterBottom>Opacidad (A)</Typography>
                <Slider
                  value={color.a}
                  onChange={(e, value) => handleColorChange('a', value)}
                  min={0}
                  max={1}
                  step={0.01}
                  valueLabelDisplay="auto"
                />
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
                    backgroundColor: getRGBA(),
                    borderRadius: 1,
                    border: '1px solid #e0e0e0',
                    backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Valores
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        fullWidth
                        value={getRGBA()}
                        InputProps={{ readOnly: true }}
                        size="small"
                      />
                      <Tooltip title="Copiar RGBA">
                        <IconButton onClick={() => copyToClipboard('rgba')}>
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        fullWidth
                        value={getHex()}
                        InputProps={{ readOnly: true }}
                        size="small"
                      />
                      <Tooltip title="Copiar HEX">
                        <IconButton onClick={() => copyToClipboard('hex')}>
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Valores RGB
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={`R: ${color.r}`} />
                  <Chip label={`G: ${color.g}`} />
                  <Chip label={`B: ${color.b}`} />
                  <Chip label={`A: ${color.a}`} />
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

export default ColorPicker;
