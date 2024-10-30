import React, { useState, useCallback, useRef } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import { Chart as ChartJS } from 'chart.js/auto';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

const chartTypes = [
  { id: 'line', name: 'Línea', component: Line },
  { id: 'bar', name: 'Barras', component: Bar },
  { id: 'pie', name: 'Circular', component: Pie },
  { id: 'doughnut', name: 'Anillo', component: Doughnut }
];

const defaultColors = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40',
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0'
];

function ChartGenerator() {
  const [chartType, setChartType] = useState('line');
  const [title, setTitle] = useState('Mi Gráfico');
  const [labels, setLabels] = useState(['Enero', 'Febrero', 'Marzo']);
  const [datasets, setDatasets] = useState([
    {
      label: 'Serie 1',
      data: [65, 59, 80],
      backgroundColor: defaultColors[0],
      borderColor: defaultColors[0]
    }
  ]);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const chartRef = useRef(null);

  const getChartData = () => ({
    labels,
    datasets: datasets.map(dataset => ({
      ...dataset,
      tension: 0.4,
      fill: chartType === 'line' ? false : true
    }))
  });

  const getChartOptions = () => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title
      }
    },
    scales: chartType === 'pie' || chartType === 'doughnut' ? undefined : {
      y: {
        beginAtZero: true
      }
    }
  });

  const addLabel = () => {
    setLabels([...labels, `Etiqueta ${labels.length + 1}`]);
    setDatasets(datasets.map(dataset => ({
      ...dataset,
      data: [...dataset.data, 0]
    })));
  };

  const removeLabel = (index) => {
    setLabels(labels.filter((_, i) => i !== index));
    setDatasets(datasets.map(dataset => ({
      ...dataset,
      data: dataset.data.filter((_, i) => i !== index)
    })));
  };

  const addDataset = () => {
    const newColor = defaultColors[datasets.length % defaultColors.length];
    setDatasets([
      ...datasets,
      {
        label: `Serie ${datasets.length + 1}`,
        data: new Array(labels.length).fill(0),
        backgroundColor: newColor,
        borderColor: newColor
      }
    ]);
  };

  const removeDataset = (index) => {
    setDatasets(datasets.filter((_, i) => i !== index));
  };

  const updateDatasetValue = (datasetIndex, valueIndex, value) => {
    const newDatasets = [...datasets];
    newDatasets[datasetIndex].data[valueIndex] = parseFloat(value) || 0;
    setDatasets(newDatasets);
  };

  const updateDatasetLabel = (index, value) => {
    const newDatasets = [...datasets];
    newDatasets[index].label = value;
    setDatasets(newDatasets);
  };

  const downloadChart = () => {
    const canvas = chartRef.current.canvas;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotification({
      open: true,
      message: 'Gráfico descargado exitosamente',
      severity: 'success'
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const ChartComponent = chartTypes.find(type => type.id === chartType).component;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Generador de Gráficos
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Descargar gráfico">
                <IconButton onClick={downloadChart}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <BarChartIcon sx={{ fontSize: 30 }} />
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Título del Gráfico"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Tipo de Gráfico</InputLabel>
                  <Select
                    value={chartType}
                    label="Tipo de Gráfico"
                    onChange={(e) => setChartType(e.target.value)}
                  >
                    {chartTypes.map(type => (
                      <MenuItem value={type.id} key={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addDataset}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Agregar Serie
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addLabel}
                  fullWidth
                >
                  Agregar Etiqueta
                </Button>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Serie</TableCell>
                      {labels.map((label, index) => (
                        <TableCell key={index}>
                          <TextField
                            size="small"
                            value={label}
                            onChange={(e) => {
                              const newLabels = [...labels];
                              newLabels[index] = e.target.value;
                              setLabels(newLabels);
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removeLabel(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      ))}
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {datasets.map((dataset, datasetIndex) => (
                      <TableRow key={datasetIndex}>
                        <TableCell>
                          <TextField
                            size="small"
                            value={dataset.label}
                            onChange={(e) => updateDatasetLabel(datasetIndex, e.target.value)}
                          />
                        </TableCell>
                        {dataset.data.map((value, valueIndex) => (
                          <TableCell key={valueIndex}>
                            <TextField
                              size="small"
                              type="number"
                              value={value}
                              onChange={(e) => updateDatasetValue(datasetIndex, valueIndex, e.target.value)}
                            />
                          </TableCell>
                        ))}
                        <TableCell>
                          <IconButton
                            onClick={() => removeDataset(datasetIndex)}
                            disabled={datasets.length === 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  height: '500px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChartComponent
                  ref={chartRef}
                  data={getChartData()}
                  options={getChartOptions()}
                />
              </Paper>
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

export default ChartGenerator;
