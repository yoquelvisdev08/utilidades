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
  Slider,
  Card,
  CardContent,
  Tabs,
  Tab
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';

const presets = {
  button: {
    basic: {
      padding: '10px 20px',
      borderRadius: '4px',
      border: 'none',
      backgroundColor: '#007bff',
      color: '#ffffff',
      cursor: 'pointer'
    },
    hover: {
      backgroundColor: '#0056b3'
    }
  },
  shadow: {
    basic: {
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    medium: {
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    },
    large: {
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
    }
  },
  border: {
    basic: {
      border: '1px solid #e0e0e0',
      borderRadius: '4px'
    },
    rounded: {
      border: '1px solid #e0e0e0',
      borderRadius: '8px'
    },
    pill: {
      border: '1px solid #e0e0e0',
      borderRadius: '50px'
    }
  }
};

function CSSGenerator() {
  const [currentTab, setCurrentTab] = useState(0);
  const [buttonStyle, setButtonStyle] = useState({
    padding: 10,
    borderRadius: 4,
    backgroundColor: '#007bff',
    color: '#ffffff',
    hoverColor: '#0056b3',
    fontSize: 16
  });
  const [shadowStyle, setShadowStyle] = useState({
    offsetX: 0,
    offsetY: 2,
    blur: 4,
    spread: 0,
    color: 'rgba(0,0,0,0.1)'
  });
  const [borderStyle, setBorderStyle] = useState({
    width: 1,
    style: 'solid',
    color: '#e0e0e0',
    radius: 4
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const getButtonCSS = () => {
    return `.button {
  padding: ${buttonStyle.padding}px ${buttonStyle.padding * 2}px;
  border-radius: ${buttonStyle.borderRadius}px;
  background-color: ${buttonStyle.backgroundColor};
  color: ${buttonStyle.color};
  border: none;
  font-size: ${buttonStyle.fontSize}px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: ${buttonStyle.hoverColor};
}`;
  };

  const getShadowCSS = () => {
    return `.box {
  box-shadow: ${shadowStyle.offsetX}px ${shadowStyle.offsetY}px ${shadowStyle.blur}px ${shadowStyle.spread}px ${shadowStyle.color};
}`;
  };

  const getBorderCSS = () => {
    return `.box {
  border: ${borderStyle.width}px ${borderStyle.style} ${borderStyle.color};
  border-radius: ${borderStyle.radius}px;
}`;
  };

  const getCurrentCSS = () => {
    switch (currentTab) {
      case 0: return getButtonCSS();
      case 1: return getShadowCSS();
      case 2: return getBorderCSS();
      default: return '';
    }
  };

  const copyToClipboard = () => {
    const css = getCurrentCSS();
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

  const renderButtonEditor = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>Padding</Typography>
          <Slider
            value={buttonStyle.padding}
            onChange={(e, value) => setButtonStyle(prev => ({ ...prev, padding: value }))}
            min={5}
            max={30}
            valueLabelDisplay="auto"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>Border Radius</Typography>
          <Slider
            value={buttonStyle.borderRadius}
            onChange={(e, value) => setButtonStyle(prev => ({ ...prev, borderRadius: value }))}
            min={0}
            max={50}
            valueLabelDisplay="auto"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>Font Size</Typography>
          <Slider
            value={buttonStyle.fontSize}
            onChange={(e, value) => setButtonStyle(prev => ({ ...prev, fontSize: value }))}
            min={12}
            max={24}
            valueLabelDisplay="auto"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>Colors</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption">Background</Typography>
              <input
                type="color"
                value={buttonStyle.backgroundColor}
                onChange={(e) => setButtonStyle(prev => ({ ...prev, backgroundColor: e.target.value }))}
                style={{ width: '100%', height: 40 }}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption">Text</Typography>
              <input
                type="color"
                value={buttonStyle.color}
                onChange={(e) => setButtonStyle(prev => ({ ...prev, color: e.target.value }))}
                style={{ width: '100%', height: 40 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption">Hover Background</Typography>
              <input
                type="color"
                value={buttonStyle.hoverColor}
                onChange={(e) => setButtonStyle(prev => ({ ...prev, hoverColor: e.target.value }))}
                style={{ width: '100%', height: 40 }}
              />
            </Grid>
          </Grid>
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Vista Previa
          </Typography>
          <Box sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <button
              style={{
                padding: `${buttonStyle.padding}px ${buttonStyle.padding * 2}px`,
                borderRadius: `${buttonStyle.borderRadius}px`,
                backgroundColor: buttonStyle.backgroundColor,
                color: buttonStyle.color,
                border: 'none',
                fontSize: `${buttonStyle.fontSize}px`,
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = buttonStyle.hoverColor}
              onMouseOut={(e) => e.target.style.backgroundColor = buttonStyle.backgroundColor}
            >
              Botón de Ejemplo
            </button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );

  const renderShadowEditor = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>Offset X</Typography>
          <Slider
            value={shadowStyle.offsetX}
            onChange={(e, value) => setShadowStyle(prev => ({ ...prev, offsetX: value }))}
            min={-20}
            max={20}
            valueLabelDisplay="auto"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>Offset Y</Typography>
          <Slider
            value={shadowStyle.offsetY}
            onChange={(e, value) => setShadowStyle(prev => ({ ...prev, offsetY: value }))}
            min={-20}
            max={20}
            valueLabelDisplay="auto"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>Blur</Typography>
          <Slider
            value={shadowStyle.blur}
            onChange={(e, value) => setShadowStyle(prev => ({ ...prev, blur: value }))}
            min={0}
            max={50}
            valueLabelDisplay="auto"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>Spread</Typography>
          <Slider
            value={shadowStyle.spread}
            onChange={(e, value) => setShadowStyle(prev => ({ ...prev, spread: value }))}
            min={-20}
            max={20}
            valueLabelDisplay="auto"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>Color</Typography>
          <input
            type="color"
            value="#000000"
            onChange={(e) => {
              const color = e.target.value;
              setShadowStyle(prev => ({
                ...prev,
                color: `${color}1a` // 10% opacity
              }));
            }}
            style={{ width: '100%', height: 40 }}
          />
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Vista Previa
          </Typography>
          <Box sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <div
              style={{
                width: 200,
                height: 200,
                backgroundColor: 'white',
                boxShadow: `${shadowStyle.offsetX}px ${shadowStyle.offsetY}px ${shadowStyle.blur}px ${shadowStyle.spread}px ${shadowStyle.color}`
              }}
            />
          </Box>
        </Box>
      </Grid>
    </Grid>
  );

  const renderBorderEditor = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>Width</Typography>
          <Slider
            value={borderStyle.width}
            onChange={(e, value) => setBorderStyle(prev => ({ ...prev, width: value }))}
            min={1}
            max={10}
            valueLabelDisplay="auto"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Style</InputLabel>
            <Select
              value={borderStyle.style}
              label="Style"
              onChange={(e) => setBorderStyle(prev => ({ ...prev, style: e.target.value }))}
            >
              <MenuItem value="solid">Solid</MenuItem>
              <MenuItem value="dashed">Dashed</MenuItem>
              <MenuItem value="dotted">Dotted</MenuItem>
              <MenuItem value="double">Double</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>Border Radius</Typography>
          <Slider
            value={borderStyle.radius}
            onChange={(e, value) => setBorderStyle(prev => ({ ...prev, radius: value }))}
            min={0}
            max={50}
            valueLabelDisplay="auto"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>Color</Typography>
          <input
            type="color"
            value={borderStyle.color}
            onChange={(e) => setBorderStyle(prev => ({ ...prev, color: e.target.value }))}
            style={{ width: '100%', height: 40 }}
          />
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Vista Previa
          </Typography>
          <Box sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <div
              style={{
                width: 200,
                height: 200,
                backgroundColor: 'white',
                border: `${borderStyle.width}px ${borderStyle.style} ${borderStyle.color}`,
                borderRadius: `${borderStyle.radius}px`
              }}
            />
          </Box>
        </Box>
      </Grid>
    </Grid>
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Generador CSS
            </Typography>
            <FormatPaintIcon sx={{ fontSize: 30 }} />
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={currentTab} onChange={(e, value) => setCurrentTab(value)}>
              <Tab label="Botones" />
              <Tab label="Sombras" />
              <Tab label="Bordes" />
            </Tabs>
          </Box>

          {currentTab === 0 && renderButtonEditor()}
          {currentTab === 1 && renderShadowEditor()}
          {currentTab === 2 && renderBorderEditor()}

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              CSS Generado
            </Typography>
            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={getCurrentCSS()}
                InputProps={{
                  readOnly: true,
                  sx: { fontFamily: 'monospace' }
                }}
              />
              <Tooltip title="Copiar CSS">
                <IconButton
                  onClick={copyToClipboard}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
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

export default CSSGenerator;
