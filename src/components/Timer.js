import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  IconButton,
  Alert,
  Snackbar,
  TextField,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import FlagIcon from '@mui/icons-material/Flag';
import DeleteIcon from '@mui/icons-material/Delete';
import TimerIcon from '@mui/icons-material/Timer';
import AlarmIcon from '@mui/icons-material/Alarm';

function Timer() {
  const [mode, setMode] = useState('stopwatch');
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [laps, setLaps] = useState([]);
  const [countdownTime, setCountdownTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const intervalRef = useRef(null);
  const audioRef = useRef(new Audio('/alarm.mp3')); // Asegúrate de tener este archivo

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  const startStopwatch = useCallback(() => {
    if (!isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
      setIsRunning(true);
    }
  }, [isRunning]);

  const startCountdown = useCallback(() => {
    const totalSeconds = 
      countdownTime.hours * 3600 + 
      countdownTime.minutes * 60 + 
      countdownTime.seconds;

    if (totalSeconds <= 0) {
      setNotification({
        open: true,
        message: 'Por favor establece un tiempo válido',
        severity: 'warning'
      });
      return;
    }

    if (!isRunning) {
      setTime(totalSeconds);
      intervalRef.current = setInterval(() => {
        setTime(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            audioRef.current.play();
            setNotification({
              open: true,
              message: '¡Tiempo completado!',
              severity: 'success'
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setIsRunning(true);
    }
  }, [isRunning, countdownTime]);

  const pause = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const addLap = () => {
    setLaps(prev => [
      {
        id: Date.now(),
        time: formatTime(time),
        lap: formatTime(
          time - (prev.length > 0 ? 
            timeToSeconds(prev[0].time) : 0)
        )
      },
      ...prev
    ]);
  };

  const timeToSeconds = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const handleCountdownChange = (field, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setCountdownTime(prev => ({
      ...prev,
      [field]: field === 'hours' ? numValue : Math.min(59, numValue)
    }));
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  const renderStopwatch = () => (
    <Box>
      <Typography variant="h1" align="center" sx={{ fontFamily: 'monospace', mb: 4 }}>
        {formatTime(time)}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon />}
          onClick={isRunning ? pause : startStopwatch}
        >
          {isRunning ? 'Pausar' : 'Iniciar'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<StopIcon />}
          onClick={stop}
        >
          Detener
        </Button>
        <Button
          variant="outlined"
          startIcon={<FlagIcon />}
          onClick={addLap}
          disabled={!isRunning}
        >
          Vuelta
        </Button>
      </Box>

      {laps.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Vueltas
          </Typography>
          <List>
            {laps.map((lap, index) => (
              <React.Fragment key={lap.id}>
                <ListItem>
                  <ListItemText
                    primary={`Vuelta ${laps.length - index}`}
                    secondary={`Total: ${lap.time} | Vuelta: ${lap.lap}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => setLaps(prev => prev.filter(l => l.id !== lap.id))}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < laps.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );

  const renderCountdown = () => (
    <Box>
      {!isRunning ? (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Horas"
              type="number"
              value={countdownTime.hours}
              onChange={(e) => handleCountdownChange('hours', e.target.value)}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Minutos"
              type="number"
              value={countdownTime.minutes}
              onChange={(e) => handleCountdownChange('minutes', e.target.value)}
              inputProps={{ min: 0, max: 59 }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Segundos"
              type="number"
              value={countdownTime.seconds}
              onChange={(e) => handleCountdownChange('seconds', e.target.value)}
              inputProps={{ min: 0, max: 59 }}
            />
          </Grid>
        </Grid>
      ) : (
        <Typography variant="h1" align="center" sx={{ fontFamily: 'monospace', mb: 4 }}>
          {formatTime(time)}
        </Typography>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon />}
          onClick={isRunning ? pause : startCountdown}
        >
          {isRunning ? 'Pausar' : 'Iniciar'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<StopIcon />}
          onClick={stop}
        >
          Detener
        </Button>
      </Box>
    </Box>
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Cronómetro y Temporizador
            </Typography>
            {mode === 'stopwatch' ? <TimerIcon sx={{ fontSize: 30 }} /> : <AlarmIcon sx={{ fontSize: 30 }} />}
          </Box>

          <Tabs
            value={mode}
            onChange={(e, newValue) => {
              if (isRunning) {
                stop();
              }
              setMode(newValue);
            }}
            sx={{ mb: 4 }}
          >
            <Tab value="stopwatch" label="Cronómetro" />
            <Tab value="countdown" label="Temporizador" />
          </Tabs>

          {mode === 'stopwatch' ? renderStopwatch() : renderCountdown()}
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

export default Timer;
