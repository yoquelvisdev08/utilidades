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
  Card,
  CardContent
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import PaletteIcon from '@mui/icons-material/Palette';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const harmonies = [
  { id: 'analogous', name: 'Análoga' },
  { id: 'monochromatic', name: 'Monocromática' },
  { id: 'triadic', name: 'Triádica' },
  { id: 'complementary', name: 'Complementaria' },
  { id: 'split-complementary', name: 'Complementaria Dividida' }
];

function PaletteGenerator() {
  const [baseColor, setBaseColor] = useState('#ff0000');
  const [harmony, setHarmony] = useState('analogous');
  const [palette, setPalette] = useState([]);
  const [lockedColors, setLockedColors] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Convertir HEX a HSL
  const hexToHSL = (hex) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };

  // Convertir HSL a HEX
  const hslToHex = (h, s, l) => {
    h = h / 360;
    s = s / 100;
    l = l / 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = x => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const generatePalette = useCallback(() => {
    const [h, s, l] = hexToHSL(baseColor);
    let newPalette = [];

    switch (harmony) {
      case 'analogous':
        newPalette = [
          hslToHex(h, s, l),
          hslToHex((h + 30) % 360, s, l),
          hslToHex((h + 60) % 360, s, l),
          hslToHex((h - 30 + 360) % 360, s, l),
          hslToHex((h - 60 + 360) % 360, s, l)
        ];
        break;

      case 'monochromatic':
        newPalette = [
          hslToHex(h, s, l),
          hslToHex(h, s, Math.max(0, l - 20)),
          hslToHex(h, s, Math.min(100, l + 20)),
          hslToHex(h, Math.max(0, s - 30), l),
          hslToHex(h, Math.min(100, s + 30), l)
        ];
        break;

      case 'triadic':
        newPalette = [
          hslToHex(h, s, l),
          hslToHex((h + 120) % 360, s, l),
          hslToHex((h + 240) % 360, s, l),
          hslToHex((h + 60) % 360, s, l),
          hslToHex((h + 180) % 360, s, l)
        ];
        break;

      case 'complementary':
        newPalette = [
          hslToHex(h, s, l),
          hslToHex((h + 180) % 360, s, l),
          hslToHex(h, Math.max(0, s - 20), l),
          hslToHex((h + 180) % 360, Math.max(0, s - 20), l),
          hslToHex(h, Math.min(100, s + 20), l)
        ];
        break;

      case 'split-complementary':
        newPalette = [
          hslToHex(h, s, l),
          hslToHex((h + 150) % 360, s, l),
          hslToHex((h + 210) % 360, s, l),
          hslToHex((h + 30) % 360, s, l),
          hslToHex((h + 330) % 360, s, l)
        ];
        break;

      default:
        newPalette = [baseColor];
    }

    // Mantener los colores bloqueados
    const finalPalette = newPalette.map((color, index) => 
      lockedColors.includes(index) ? palette[index] : color
    );

    setPalette(finalPalette);
  }, [baseColor, harmony, palette, lockedColors]);

  const toggleLock = (index) => {
    setLockedColors(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color);
    setNotification({
      open: true,
      message: 'Color copiado al portapapeles',
      severity: 'success'
    });
  };

  const copyPalette = () => {
    const css = palette.map(color => color).join(', ');
    navigator.clipboard.writeText(css);
    setNotification({
      open: true,
      message: 'Paleta copiada al portapapeles',
      severity: 'success'
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Generar paleta inicial
  React.useEffect(() => {
    generatePalette();
  }, [generatePalette]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Generador de Paletas
            </Typography>
            <PaletteIcon sx={{ fontSize: 30 }} />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Color Base
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={baseColor}
                    onChange={(e) => setBaseColor(e.target.value)}
                    style={{ width: 50, height: 50, padding: 0, border: 'none' }}
                  />
                  <TextField
                    value={baseColor}
                    onChange={(e) => setBaseColor(e.target.value)}
                    size="small"
                    sx={{ width: 120 }}
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Armonía de Color</InputLabel>
                  <Select
                    value={harmony}
                    label="Armonía de Color"
                    onChange={(e) => setHarmony(e.target.value)}
                  >
                    {harmonies.map(h => (
                      <MenuItem value={h.id} key={h.id}>
                        {h.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={generatePalette}
                  fullWidth
                >
                  Generar Nueva Paleta
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Paleta Generada
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {palette.map((color, index) => (
                  <Card key={index} variant="outlined">
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          backgroundColor: color,
                          borderRadius: 1,
                          border: '1px solid #e0e0e0'
                        }}
                      />
                      <TextField
                        value={color}
                        size="small"
                        InputProps={{ readOnly: true }}
                      />
                      <IconButton onClick={() => copyToClipboard(color)}>
                        <ContentCopyIcon />
                      </IconButton>
                      <IconButton onClick={() => toggleLock(index)}>
                        {lockedColors.includes(index) ? <LockIcon /> : <LockOpenIcon />}
                      </IconButton>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  startIcon={<ContentCopyIcon />}
                  onClick={copyPalette}
                >
                  Copiar Todos los Colores
                </Button>
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

export default PaletteGenerator;
