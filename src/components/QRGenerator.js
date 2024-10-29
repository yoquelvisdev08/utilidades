import React, { useState, useEffect } from 'react';
import { 
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Slider,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Alert,
  Snackbar,
  FormControlLabel,
  Switch,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import HistoryIcon from '@mui/icons-material/History';
import InfoIcon from '@mui/icons-material/Info';

const qrTypes = {
  text: {
    name: 'Texto',
    fields: [
      { name: 'text', label: 'Texto', type: 'text', multiline: true }
    ]
  },
  url: {
    name: 'URL',
    fields: [
      { name: 'url', label: 'URL', type: 'url', placeholder: 'https://ejemplo.com' }
    ]
  },
  email: {
    name: 'Correo Electrónico',
    fields: [
      { name: 'email', label: 'Correo', type: 'email' },
      { name: 'subject', label: 'Asunto', type: 'text' },
      { name: 'body', label: 'Mensaje', type: 'text', multiline: true }
    ]
  },
  phone: {
    name: 'Teléfono',
    fields: [
      { name: 'phone', label: 'Número de Teléfono', type: 'tel' }
    ]
  },
  wifi: {
    name: 'WiFi',
    fields: [
      { name: 'ssid', label: 'Nombre de Red (SSID)', type: 'text' },
      { name: 'password', label: 'Contraseña', type: 'password' },
      { name: 'encryption', label: 'Encriptación', type: 'select', options: ['WPA', 'WEP', 'None'] }
    ]
  },
  vcard: {
    name: 'Contacto (vCard)',
    fields: [
      { name: 'name', label: 'Nombre', type: 'text' },
      { name: 'email', label: 'Correo', type: 'email' },
      { name: 'phone', label: 'Teléfono', type: 'tel' },
      { name: 'company', label: 'Empresa', type: 'text' },
      { name: 'title', label: 'Cargo', type: 'text' },
      { name: 'url', label: 'Sitio Web', type: 'url' }
    ]
  }
};

function QRGenerator() {
  const [type, setType] = useState('text');
  const [formData, setFormData] = useState({});
  const [qrImage, setQrImage] = useState('');
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [settings, setSettings] = useState({
    size: 200,
    foreground: '#000000',
    background: '#FFFFFF',
    margin: 4,
    errorCorrection: 'M'
  });
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      generateQR();
    }
  }, [formData, settings]);

  const handleTypeChange = (event) => {
    setType(event.target.value);
    setFormData({});
    setQrImage('');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateQR = async () => {
    try {
      // Aquí iría la integración real con una API de generación de QR
      const data = encodeData();
      if (!data) return;

      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&size=${settings.size}x${settings.size}&margin=${settings.margin}`;
      setQrImage(qrUrl);

      // Guardar en historial
      const historyItem = {
        id: Date.now(),
        type,
        data: formData,
        settings: { ...settings },
        qrUrl,
        timestamp: new Date().toISOString()
      };
      setHistory(prev => [historyItem, ...prev]);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Error al generar el código QR',
        severity: 'error'
      });
    }
  };

  const encodeData = () => {
    switch (type) {
      case 'text':
        return formData.text;
      case 'url':
        return formData.url;
      case 'email':
        return `mailto:${formData.email}?subject=${encodeURIComponent(formData.subject || '')}&body=${encodeURIComponent(formData.body || '')}`;
      case 'phone':
        return `tel:${formData.phone}`;
      case 'wifi':
        return `WIFI:T:${formData.encryption};S:${formData.ssid};P:${formData.password};;`;
      case 'vcard':
        return `BEGIN:VCARD
VERSION:3.0
FN:${formData.name || ''}
TEL:${formData.phone || ''}
EMAIL:${formData.email || ''}
ORG:${formData.company || ''}
TITLE:${formData.title || ''}
URL:${formData.url || ''}
END:VCARD`;
      default:
        return null;
    }
  };

  const handleDownload = () => {
    if (!qrImage) return;

    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `qr-${type}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotification({
      open: true,
      message: 'Código QR descargado exitosamente',
      severity: 'success'
    });
  };

  const toggleFavorite = (item) => {
    const isFavorite = favorites.some(fav => fav.id === item.id);
    if (isFavorite) {
      setFavorites(prev => prev.filter(fav => fav.id !== item.id));
    } else {
      setFavorites(prev => [...prev, item]);
    }
  };

  const loadSaved = (item) => {
    setType(item.type);
    setFormData(item.data);
    setSettings(item.settings);
    setQrImage(item.qrUrl);
    setShowHistory(false);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Tipo de QR</InputLabel>
              <Select
                value={type}
                label="Tipo de QR"
                onChange={handleTypeChange}
              >
                {Object.entries(qrTypes).map(([key, value]) => (
                  <MenuItem value={key} key={key}>
                    {value.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Grid container spacing={2}>
            {qrTypes[type].fields.map((field) => (
              <Grid item xs={12} key={field.name}>
                {field.type === 'select' ? (
                  <FormControl fullWidth>
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                      value={formData[field.name] || ''}
                      label={field.label}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    >
                      {field.options.map(option => (
                        <MenuItem value={option} key={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    label={field.label}
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    multiline={field.multiline}
                    rows={field.multiline ? 4 : 1}
                    placeholder={field.placeholder}
                  />
                )}
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Configuración
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography gutterBottom>
                  Tamaño: {settings.size}x{settings.size}
                </Typography>
                <Slider
                  value={settings.size}
                  onChange={(e, newValue) => setSettings({ ...settings, size: newValue })}
                  min={100}
                  max={1000}
                  step={50}
                  marks={[
                    { value: 100, label: '100' },
                    { value: 500, label: '500' },
                    { value: 1000, label: '1000' }
                  ]}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography gutterBottom>
                  Margen: {settings.margin}
                </Typography>
                <Slider
                  value={settings.margin}
                  onChange={(e, newValue) => setSettings({ ...settings, margin: newValue })}
                  min={0}
                  max={10}
                  marks
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Corrección de Error</InputLabel>
                  <Select
                    value={settings.errorCorrection}
                    label="Corrección de Error"
                    onChange={(e) => setSettings({ ...settings, errorCorrection: e.target.value })}
                  >
                    <MenuItem value="L">Baja (7%)</MenuItem>
                    <MenuItem value="M">Media (15%)</MenuItem>
                    <MenuItem value="Q">Alta (25%)</MenuItem>
                    <MenuItem value="H">Máxima (30%)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {qrImage && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <img
                src={qrImage}
                alt="QR Code"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '8px'
                }}
              />
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                sx={{ mt: 2 }}
              >
                Descargar QR
              </Button>
            </Box>
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Favoritos" />
              <Tab label="Historial" />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            favorites.length > 0 ? (
              <List>
                {favorites.map((item) => (
                  <ListItem
                    key={item.id}
                    sx={{
                      border: '1px solid #eee',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemText
                      primary={qrTypes[item.type].name}
                      secondary={new Date(item.timestamp).toLocaleString()}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => loadSaved(item)}
                    />
                    <IconButton
                      edge="end"
                      onClick={() => toggleFavorite(item)}
                    >
                      <StarIcon color="warning" />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" align="center">
                No hay códigos QR favoritos
              </Typography>
            )
          )}

          {activeTab === 1 && (
            history.length > 0 ? (
              <List>
                {history.map((item) => (
                  <ListItem
                    key={item.id}
                    sx={{
                      border: '1px solid #eee',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemText
                      primary={qrTypes[item.type].name}
                      secondary={new Date(item.timestamp).toLocaleString()}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => loadSaved(item)}
                    />
                    <IconButton
                      edge="end"
                      onClick={() => toggleFavorite(item)}
                    >
                      {favorites.some(fav => fav.id === item.id) ? (
                        <StarIcon color="warning" />
                      ) : (
                        <StarBorderIcon />
                      )}
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" align="center">
                No hay historial de códigos QR
              </Typography>
            )
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

export default QRGenerator;
