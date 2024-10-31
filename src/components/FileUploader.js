import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Box, 
  Typography, 
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';

const FileUploader = ({ onFileSelect, accept, multiple = true }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept: accept ? { [accept.split('/')[0]]: [accept] } : undefined
  });

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 
            'Suelta los archivos aquí' : 
            'Arrastra y suelta tus archivos aquí'
          }
        </Typography>
        <Typography variant="body2" color="text.secondary">
          o haz clic para seleccionar archivos
        </Typography>
        
        <List sx={{ mt: 2, width: '100%', maxWidth: 360, mx: 'auto' }}>
          <ListItem>
            <ListItemIcon>
              <FileIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Formatos soportados"
              secondary={accept ? `Archivos ${accept.split('/')[1].toUpperCase()}` : "Todos los archivos"}
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default FileUploader;
