import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper,
  TextField,
  Button,
  Grid,
  ButtonGroup,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';

function TextTools() {
  const [text, setText] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [savedTexts, setSavedTexts] = useState([]);
  const [statistics, setStatistics] = useState({
    characters: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');

  useEffect(() => {
    updateStatistics();
  }, [text]);

  useEffect(() => {
    if (autoSave && text) {
      const timeoutId = setTimeout(() => {
        saveText('Autoguardado');
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [text, autoSave]);

  const updateStatistics = () => {
    setStatistics({
      characters: text.length,
      words: text.trim() ? text.trim().split(/\s+/).length : 0,
      sentences: text.trim() ? text.split(/[.!?]+/).length - 1 : 0,
      paragraphs: text.trim() ? text.split(/\n\s*\n/).length : 0
    });
  };

  const addToHistory = (newText) => {
    const newHistory = [...history.slice(0, historyIndex + 1), newText];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleTextChange = (event) => {
    const newText = event.target.value;
    setText(newText);
    addToHistory(newText);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setText(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setText(history[historyIndex + 1]);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSaveDialogOpen = () => {
    setSaveDialogOpen(true);
    handleMenuClose();
  };

  const handleSaveDialogClose = () => {
    setSaveDialogOpen(false);
    setSaveName('');
  };

  const saveText = (name = '') => {
    if (!text.trim()) return;
    
    const savedText = {
      id: Date.now(),
      name: name || saveName || `Texto ${savedTexts.length + 1}`,
      content: text,
      date: new Date().toLocaleString(),
      statistics: { ...statistics }
    };
    
    setSavedTexts([savedText, ...savedTexts]);
    handleSaveDialogClose();
  };

  const loadSavedText = (savedText) => {
    setText(savedText.content);
    addToHistory(savedText.content);
  };

  const deleteSavedText = (id) => {
    setSavedTexts(savedTexts.filter(text => text.id !== id));
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(text);
  };

  const transformText = (transformation) => {
    let newText = text;
    switch (transformation) {
      case 'uppercase':
        newText = text.toUpperCase();
        break;
      case 'lowercase':
        newText = text.toLowerCase();
        break;
      case 'capitalize':
        newText = text.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        break;
      case 'removeSpaces':
        newText = text.replace(/\s+/g, ' ').trim();
        break;
      case 'removePunctuation':
        newText = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
        break;
      default:
        break;
    }
    setText(newText);
    addToHistory(newText);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Editor de Texto</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Deshacer">
                <IconButton onClick={handleUndo} disabled={historyIndex <= 0}>
                  <UndoIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Rehacer">
                <IconButton onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
                  <RedoIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Copiar">
                <IconButton onClick={handleCopyToClipboard} disabled={!text}>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Guardar">
                <IconButton onClick={handleSaveDialogOpen} disabled={!text}>
                  <SaveIcon />
                </IconButton>
              </Tooltip>
              <IconButton onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={12}
            value={text}
            onChange={handleTextChange}
            placeholder="Escribe o pega tu texto aquí..."
            variant="outlined"
          />

          <Box sx={{ mt: 2 }}>
            <ButtonGroup variant="outlined" size="small">
              <Button onClick={() => transformText('uppercase')}>MAYÚSCULAS</Button>
              <Button onClick={() => transformText('lowercase')}>minúsculas</Button>
              <Button onClick={() => transformText('capitalize')}>Capitalizar</Button>
              <Button onClick={() => transformText('removeSpaces')}>Eliminar Espacios</Button>
              <Button onClick={() => transformText('removePunctuation')}>Eliminar Puntuación</Button>
            </ButtonGroup>
          </Box>

          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip label={`${statistics.characters} caracteres`} />
            <Chip label={`${statistics.words} palabras`} />
            <Chip label={`${statistics.sentences} oraciones`} />
            <Chip label={`${statistics.paragraphs} párrafos`} />
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Textos Guardados</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  size="small"
                />
              }
              label="Autoguardar"
            />
          </Box>

          {savedTexts.length > 0 ? (
            <List>
              {savedTexts.map((savedText) => (
                <ListItem
                  key={savedText.id}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => deleteSavedText(savedText.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                  sx={{ border: '1px solid #eee', borderRadius: 1, mb: 1 }}
                >
                  <ListItemText
                    primary={savedText.name}
                    secondary={
                      <>
                        <Typography variant="caption" display="block">
                          {savedText.date}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {savedText.statistics.words} palabras
                        </Typography>
                      </>
                    }
                    sx={{ cursor: 'pointer' }}
                    onClick={() => loadSavedText(savedText)}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" align="center">
              No hay textos guardados
            </Typography>
          )}
        </Paper>
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          setText('');
          setHistory([]);
          setHistoryIndex(-1);
          handleMenuClose();
        }}>
          Nuevo texto
        </MenuItem>
        <MenuItem onClick={() => {
          setShowHistory(!showHistory);
          handleMenuClose();
        }}>
          Ver historial
        </MenuItem>
      </Menu>

      <Dialog open={saveDialogOpen} onClose={handleSaveDialogClose}>
        <DialogTitle>Guardar Texto</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del texto"
            fullWidth
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveDialogClose}>Cancelar</Button>
          <Button onClick={() => saveText()} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showHistory} onClose={() => setShowHistory(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon />
            Historial de Cambios
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {history.map((item, index) => (
              <ListItem
                key={index}
                sx={{
                  border: '1px solid #eee',
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: index === historyIndex ? '#f0f7ff' : 'transparent'
                }}
              >
                <ListItemText
                  primary={`Versión ${index + 1}`}
                  secondary={item.slice(0, 100) + (item.length > 100 ? '...' : '')}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

export default TextTools;
