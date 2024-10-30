import React, { useState } from 'react';
import { 
  Box, 
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Button,
  Breadcrumbs,
  Link,
  Divider
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CompressIcon from '@mui/icons-material/Compress';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import TranslateIcon from '@mui/icons-material/Translate';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import CalculateIcon from '@mui/icons-material/Calculate';
import CodeIcon from '@mui/icons-material/Code';
import DataObjectIcon from '@mui/icons-material/DataObject';
import BarChartIcon from '@mui/icons-material/BarChart';
import SecurityIcon from '@mui/icons-material/Security';
import TimerIcon from '@mui/icons-material/Timer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaletteIcon from '@mui/icons-material/Palette';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import GradientIcon from '@mui/icons-material/Gradient';

// Importar los componentes
import ImageConverter from './converters/ImageConverter';
import DocumentConverter from './converters/DocumentConverter';
import AudioConverter from './converters/AudioConverter';
import VideoConverter from './converters/VideoConverter';
import QRGenerator from './QRGenerator';
import ImageCompressor from './ImageCompressor';
import TextTools from './TextTools';
import AITextGenerator from './AITextGenerator';
import OCRTool from './OCRTool';

const tools = [
  {
    id: 'converters',
    title: 'Convertidores',
    tools: [
      {
        id: 'image',
        name: 'Convertidor de Imágenes',
        description: 'Convierte entre formatos de imagen como JPG, PNG, WebP y más',
        icon: ImageIcon,
        color: '#4CAF50',
        component: ImageConverter,
        formats: ['jpg', 'png', 'gif', 'webp', 'svg']
      },
      {
        id: 'document',
        name: 'Convertidor de Documentos',
        description: 'Convierte documentos entre PDF, Word, TXT y más',
        icon: DescriptionIcon,
        color: '#2196F3',
        component: DocumentConverter,
        formats: ['pdf', 'docx', 'txt', 'rtf']
      },
      {
        id: 'audio',
        name: 'Convertidor de Audio',
        description: 'Convierte archivos de audio entre MP3, WAV, OGG y más',
        icon: AudiotrackIcon,
        color: '#FF9800',
        component: AudioConverter,
        formats: ['mp3', 'wav', 'ogg', 'flac']
      },
      {
        id: 'video',
        name: 'Convertidor de Video',
        description: 'Convierte videos entre MP4, WebM, MKV y más',
        icon: VideoFileIcon,
        color: '#E91E63',
        component: VideoConverter,
        formats: ['mp4', 'webm', 'mkv']
      }
    ]
  },
  {
    id: 'tools',
    title: 'Herramientas',
    tools: [
      {
        id: 'qr',
        name: 'Generador QR',
        description: 'Crea códigos QR personalizados para enlaces, texto, contactos y más',
        icon: QrCodeIcon,
        color: '#673AB7',
        component: QRGenerator
      },
      {
        id: 'compressor',
        name: 'Compresor de Imágenes',
        description: 'Reduce el tamaño de tus imágenes manteniendo la calidad',
        icon: CompressIcon,
        color: '#009688',
        component: ImageCompressor
      },
      {
        id: 'text',
        name: 'Herramientas de Texto',
        description: 'Manipula y formatea texto con múltiples herramientas',
        icon: TextFieldsIcon,
        color: '#795548',
        component: TextTools
      },
      {
        id: 'ai',
        name: 'Generador de Texto IA',
        description: 'Genera texto utilizando inteligencia artificial',
        icon: SmartToyIcon,
        color: '#3F51B5',
        component: AITextGenerator
      },
      {
        id: 'ocr',
        name: 'Extractor de Texto (OCR)',
        description: 'Extrae texto de imágenes y documentos escaneados',
        icon: DocumentScannerIcon,
        color: '#607D8B',
        component: OCRTool
      }
    ]
  },
  {
    id: 'developers',
    title: 'Herramientas para Desarrolladores',
    tools: [
      {
        id: 'json',
        name: 'Editor JSON',
        description: 'Formatea, valida y transforma datos JSON',
        icon: DataObjectIcon,
        color: '#F44336',
        component: null // Por implementar
      },
      {
        id: 'code',
        name: 'Formateador de Código',
        description: 'Formatea código en varios lenguajes de programación',
        icon: CodeIcon,
        color: '#9C27B0',
        component: null // Por implementar
      },
      {
        id: 'minifier',
        name: 'Minificador',
        description: 'Minifica JavaScript, CSS y HTML',
        icon: CompressIcon,
        color: '#FF5722',
        component: null // Por implementar
      },
      {
        id: 'diff',
        name: 'Comparador de Código',
        description: 'Compara y encuentra diferencias entre códigos',
        icon: CodeIcon,
        color: '#795548',
        component: null // Por implementar
      }
    ]
  },
  {
    id: 'design',
    title: 'Herramientas de Diseño',
    tools: [
      {
        id: 'color-picker',
        name: 'Selector de Color',
        description: 'Herramienta avanzada para selección de colores',
        icon: ColorLensIcon,
        color: '#E91E63',
        component: null // Por implementar
      },
      {
        id: 'gradient',
        name: 'Generador de Gradientes',
        description: 'Crea gradientes CSS personalizados',
        icon: GradientIcon,
        color: '#9C27B0',
        component: null // Por implementar
      },
      {
        id: 'palette',
        name: 'Generador de Paletas',
        description: 'Genera paletas de colores armoniosas',
        icon: PaletteIcon,
        color: '#673AB7',
        component: null // Por implementar
      },
      {
        id: 'css',
        name: 'Generador CSS',
        description: 'Genera estilos CSS para botones, sombras y más',
        icon: FormatPaintIcon,
        color: '#3F51B5',
        component: null // Por implementar
      }
    ]
  },
  {
    id: 'utilities',
    title: 'Utilidades',
    tools: [
      {
        id: 'translator',
        name: 'Traductor',
        description: 'Traduce texto entre múltiples idiomas',
        icon: TranslateIcon,
        color: '#2196F3',
        component: null // Por implementar
      },
      {
        id: 'calculator',
        name: 'Calculadora Avanzada',
        description: 'Realiza cálculos matemáticos complejos',
        icon: CalculateIcon,
        color: '#00BCD4',
        component: null // Por implementar
      },
      {
        id: 'charts',
        name: 'Generador de Gráficos',
        description: 'Crea gráficos a partir de datos',
        icon: BarChartIcon,
        color: '#4CAF50',
        component: null // Por implementar
      },
      {
        id: 'encryption',
        name: 'Encriptación',
        description: 'Encripta y desencripta texto',
        icon: SecurityIcon,
        color: '#FF5722',
        component: null // Por implementar
      },
      {
        id: 'timer',
        name: 'Cronómetro y Temporizador',
        description: 'Herramientas de medición de tiempo',
        icon: TimerIcon,
        color: '#795548',
        component: null // Por implementar
      }
    ]
  }
];

function FileConverterHub() {
  const [selectedTool, setSelectedTool] = useState(null);

  const handleToolSelect = (tool) => {
    if (tool.component) {
      setSelectedTool(tool);
    } else {
      // Mostrar mensaje de "Próximamente"
      alert('Esta herramienta estará disponible próximamente');
    }
  };

  const handleBack = () => {
    setSelectedTool(null);
  };

  const renderToolGrid = () => (
    <Box>
      {tools.map((section) => (
        <Box key={section.id} sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
            {section.title}
          </Typography>
          <Grid container spacing={3}>
            {section.tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={tool.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      opacity: tool.component ? 1 : 0.7,
                      '&:hover': {
                        transform: tool.component ? 'translateY(-4px)' : 'none',
                        boxShadow: tool.component ? '0 8px 24px rgba(0,0,0,0.1)' : 'none'
                      }
                    }}
                    onClick={() => handleToolSelect(tool)}
                  >
                    <CardMedia
                      sx={{
                        height: 140,
                        backgroundColor: tool.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0))',
                          zIndex: 1
                        }
                      }}
                    >
                      <Icon sx={{ fontSize: 64, color: 'white', zIndex: 2 }} />
                      {!tool.component && (
                        <Typography
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            color: 'white',
                            bgcolor: 'rgba(0,0,0,0.5)',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem'
                          }}
                        >
                          Próximamente
                        </Typography>
                      )}
                    </CardMedia>
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div">
                        {tool.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tool.description}
                      </Typography>
                      {tool.formats && (
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {tool.formats.map(format => (
                            <Typography
                              key={format}
                              variant="caption"
                              sx={{
                                px: 1,
                                py: 0.5,
                                bgcolor: 'action.hover',
                                borderRadius: 1
                              }}
                            >
                              {format}
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {selectedTool ? (
        <>
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{ mb: 2 }}
            >
              Volver
            </Button>
            <Breadcrumbs>
              <Link
                component="button"
                variant="body1"
                onClick={handleBack}
                underline="hover"
                color="inherit"
              >
                Inicio
              </Link>
              <Typography color="text.primary">
                {selectedTool.name}
              </Typography>
            </Breadcrumbs>
          </Box>
          <selectedTool.component />
        </>
      ) : (
        <>
          <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 600 }}>
            Caja de Herramientas
          </Typography>
          <Typography 
            variant="subtitle1" 
            align="center" 
            color="text.secondary"
            sx={{ mb: 6 }}
          >
            Todas las herramientas que necesitas en un solo lugar
          </Typography>
          {renderToolGrid()}
        </>
      )}
    </Container>
  );
}

export default FileConverterHub;
