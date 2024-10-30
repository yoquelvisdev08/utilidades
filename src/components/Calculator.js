import React, { useState, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  TextField,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';

const modes = [
  { id: 'standard', name: 'Estándar' },
  { id: 'scientific', name: 'Científica' },
  { id: 'programmer', name: 'Programador' }
];

const numberSystems = [
  { id: 'decimal', name: 'Decimal', base: 10 },
  { id: 'binary', name: 'Binario', base: 2 },
  { id: 'octal', name: 'Octal', base: 8 },
  { id: 'hexadecimal', name: 'Hexadecimal', base: 16 }
];

function Calculator() {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState(null);
  const [lastNumber, setLastNumber] = useState(null);
  const [operation, setOperation] = useState(null);
  const [mode, setMode] = useState('standard');
  const [numberSystem, setNumberSystem] = useState('decimal');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const clearDisplay = () => {
    setDisplay('0');
    setLastNumber(null);
    setOperation(null);
  };

  const handleNumber = (num) => {
    if (display === '0' || display === 'Error') {
      setDisplay(num.toString());
    } else {
      setDisplay(display + num);
    }
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperator = (op) => {
    try {
      if (lastNumber === null) {
        setLastNumber(parseFloat(display));
        setDisplay('0');
        setOperation(op);
      } else {
        calculate();
        setOperation(op);
      }
    } catch (error) {
      setDisplay('Error');
      setNotification({
        open: true,
        message: 'Error en la operación',
        severity: 'error'
      });
    }
  };

  const calculate = () => {
    try {
      const current = parseFloat(display);
      let result;

      switch (operation) {
        case '+':
          result = lastNumber + current;
          break;
        case '-':
          result = lastNumber - current;
          break;
        case '*':
          result = lastNumber * current;
          break;
        case '/':
          if (current === 0) throw new Error('División por cero');
          result = lastNumber / current;
          break;
        case 'pow':
          result = Math.pow(lastNumber, current);
          break;
        default:
          result = current;
      }

      setDisplay(result.toString());
      setLastNumber(null);
      setOperation(null);
    } catch (error) {
      setDisplay('Error');
      setNotification({
        open: true,
        message: error.message || 'Error en el cálculo',
        severity: 'error'
      });
    }
  };

  const handleScientific = (func) => {
    try {
      const current = parseFloat(display);
      let result;

      switch (func) {
        case 'sin':
          result = Math.sin(current);
          break;
        case 'cos':
          result = Math.cos(current);
          break;
        case 'tan':
          result = Math.tan(current);
          break;
        case 'log':
          result = Math.log10(current);
          break;
        case 'ln':
          result = Math.log(current);
          break;
        case 'sqrt':
          result = Math.sqrt(current);
          break;
        case 'square':
          result = current * current;
          break;
        case 'factorial':
          result = factorial(current);
          break;
        default:
          result = current;
      }

      setDisplay(result.toString());
    } catch (error) {
      setDisplay('Error');
      setNotification({
        open: true,
        message: 'Error en la operación científica',
        severity: 'error'
      });
    }
  };

  const factorial = (n) => {
    if (n < 0) throw new Error('No existe factorial de números negativos');
    if (n === 0) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  };

  const convertBase = (value, fromBase, toBase) => {
    try {
      const decimal = parseInt(value, fromBase);
      return decimal.toString(toBase).toUpperCase();
    } catch (error) {
      throw new Error('Error en la conversión');
    }
  };

  const handleBaseConversion = (newBase) => {
    try {
      const currentBase = numberSystems.find(sys => sys.id === numberSystem).base;
      const targetBase = numberSystems.find(sys => sys.id === newBase).base;
      
      if (currentBase !== targetBase) {
        const result = convertBase(display, currentBase, targetBase);
        setDisplay(result);
      }
      
      setNumberSystem(newBase);
    } catch (error) {
      setDisplay('Error');
      setNotification({
        open: true,
        message: 'Error en la conversión de base',
        severity: 'error'
      });
    }
  };

  const handleMemory = (action) => {
    try {
      const current = parseFloat(display);
      
      switch (action) {
        case 'MS':
          setMemory(current);
          break;
        case 'MR':
          if (memory !== null) setDisplay(memory.toString());
          break;
        case 'M+':
          if (memory !== null) setMemory(memory + current);
          break;
        case 'M-':
          if (memory !== null) setMemory(memory - current);
          break;
        case 'MC':
          setMemory(null);
          break;
      }
    } catch (error) {
      setNotification({
        open: true,
        message: 'Error en operación de memoria',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const renderStandardKeypad = () => (
    <Grid container spacing={1}>
      {/* Fila 1 */}
      <Grid item xs={3}>
        <Button fullWidth variant="outlined" onClick={() => handleMemory('MC')}>MC</Button>
      </Grid>
      <Grid item xs={3}>
        <Button fullWidth variant="outlined" onClick={() => handleMemory('MR')}>MR</Button>
      </Grid>
      <Grid item xs={3}>
        <Button fullWidth variant="outlined" onClick={() => handleMemory('M+')}>M+</Button>
      </Grid>
      <Grid item xs={3}>
        <Button fullWidth variant="outlined" onClick={() => handleMemory('M-')}>M-</Button>
      </Grid>

      {/* Fila 2 */}
      <Grid item xs={3}>
        <Button fullWidth variant="outlined" onClick={clearDisplay}>C</Button>
      </Grid>
      <Grid item xs={3}>
        <Button fullWidth variant="outlined" onClick={() => handleOperator('/')}>/</Button>
      </Grid>
      <Grid item xs={3}>
        <Button fullWidth variant="outlined" onClick={() => handleOperator('*')}>×</Button>
      </Grid>
      <Grid item xs={3}>
        <Button fullWidth variant="outlined" onClick={() => handleOperator('-')}>-</Button>
      </Grid>

      {/* Fila 3-5: Números */}
      {[7, 8, 9, 4, 5, 6, 1, 2, 3].map(num => (
        <Grid item xs={3} key={num}>
          <Button fullWidth variant="contained" onClick={() => handleNumber(num)}>
            {num}
          </Button>
        </Grid>
      ))}

      {/* Fila 6 */}
      <Grid item xs={3}>
        <Button fullWidth variant="contained" onClick={() => handleNumber(0)}>0</Button>
      </Grid>
      <Grid item xs={3}>
        <Button fullWidth variant="outlined" onClick={handleDecimal}>.</Button>
      </Grid>
      <Grid item xs={3}>
        <Button fullWidth variant="contained" color="primary" onClick={calculate}>=</Button>
      </Grid>
      <Grid item xs={3}>
        <Button fullWidth variant="outlined" onClick={() => handleOperator('+')}>+</Button>
      </Grid>
    </Grid>
  );

  const renderScientificKeypad = () => (
    <Grid container spacing={1}>
      {/* Funciones científicas */}
      <Grid item xs={3}>
        <Button fullWidth variant="outlined" onClick={() => handleScientific('sin')}>sin</Button>
      </Grid>
      <Grid item xs={3}>
        <Button fullWidth variant="outlined" onClick={() => handleScientific('cos')}>cos</Button>
      </Grid>
      <Grid item xs={3}>
        <Button fullWidth variant="outlined" onClick={() => handleScientific('tan')}>tan</Button>
      </Grid>
      <Grid item xs={3}>
        <Button fullWidth variant="outlined" onClick={() => handleScientific('log')}>log</Button>
      </Grid>

      <Grid item xs={3}>
        <Button fullWidth variant="outlined" onClick={() => handleScientific('ln')}>ln</Button>
      </Grid>
      <Grid item xs={3}>
        <Button fullWidth variant="outlined" onClick={() => handleScientific('sqrt')}>√</Button>
      </Grid>
      <Grid item xs={3}>
        <Button fullWidth variant="outlined" onClick={() => handleScientific('square')}>x²</Button>
      </Grid>
      <Grid item xs={3}>
        <Button fullWidth variant="outlined" onClick={() => handleOperator('pow')}>xʸ</Button>
      </Grid>

      {/* Teclado estándar */}
      {renderStandardKeypad()}
    </Grid>
  );

  const renderProgrammerKeypad = () => (
    <Box>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Sistema Numérico</InputLabel>
        <Select
          value={numberSystem}
          label="Sistema Numérico"
          onChange={(e) => handleBaseConversion(e.target.value)}
        >
          {numberSystems.map(system => (
            <MenuItem value={system.id} key={system.id}>
              {system.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={1}>
        {/* Botones hexadecimales */}
        <Grid item xs={2}>
          <Button fullWidth variant="outlined" onClick={() => handleNumber('A')}>A</Button>
        </Grid>
        <Grid item xs={2}>
          <Button fullWidth variant="outlined" onClick={() => handleNumber('B')}>B</Button>
        </Grid>
        <Grid item xs={2}>
          <Button fullWidth variant="outlined" onClick={() => handleNumber('C')}>C</Button>
        </Grid>
        <Grid item xs={2}>
          <Button fullWidth variant="outlined" onClick={() => handleNumber('D')}>D</Button>
        </Grid>
        <Grid item xs={2}>
          <Button fullWidth variant="outlined" onClick={() => handleNumber('E')}>E</Button>
        </Grid>
        <Grid item xs={2}>
          <Button fullWidth variant="outlined" onClick={() => handleNumber('F')}>F</Button>
        </Grid>

        {/* Teclado numérico */}
        {renderStandardKeypad()}
      </Grid>
    </Box>
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Calculadora Avanzada
            </Typography>
            <CalculateIcon sx={{ fontSize: 30 }} />
          </Box>

          <Tabs
            value={mode}
            onChange={(e, newValue) => setMode(newValue)}
            sx={{ mb: 3 }}
          >
            {modes.map(m => (
              <Tab key={m.id} value={m.id} label={m.name} />
            ))}
          </Tabs>

          <TextField
            fullWidth
            value={display}
            InputProps={{
              readOnly: true,
              sx: { 
                fontFamily: 'monospace',
                fontSize: '1.5rem',
                textAlign: 'right'
              }
            }}
            sx={{ mb: 2 }}
          />

          {mode === 'standard' && renderStandardKeypad()}
          {mode === 'scientific' && renderScientificKeypad()}
          {mode === 'programmer' && renderProgrammerKeypad()}
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

export default Calculator;
