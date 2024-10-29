const imageSettings = {
  quality: {
    min: 1,
    max: 100,
    default: 90,
    step: 1
  },
  resize: {
    widthMin: 16,
    widthMax: 7680,
    heightMin: 16,
    heightMax: 4320
  },
  formats: {
    input: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg'],
    output: {
      'jpg': {
        name: 'JPEG',
        settings: ['quality', 'resize'],
        description: 'Formato común para fotografías'
      },
      'png': {
        name: 'PNG',
        settings: ['quality', 'resize'],
        description: 'Ideal para imágenes con transparencia'
      },
      'webp': {
        name: 'WebP',
        settings: ['quality', 'resize'],
        description: 'Formato moderno con mejor compresión'
      },
      'gif': {
        name: 'GIF',
        settings: ['resize'],
        description: 'Para imágenes animadas'
      },
      'bmp': {
        name: 'BMP',
        settings: ['resize'],
        description: 'Formato sin compresión'
      }
    }
  }
};

const validateImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
          size: file.size
        });
      };
      img.onerror = () => reject(new Error('Archivo de imagen inválido'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
};

const convertImage = async (file, targetFormat, settings = {}) => {
  try {
    // Validar el archivo
    const imageInfo = await validateImage(file);
    
    // Aplicar configuraciones
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    return new Promise((resolve, reject) => {
      img.onload = () => {
        // Calcular dimensiones
        let width = img.width;
        let height = img.height;
        
        if (settings.resize) {
          const { maxWidth, maxHeight } = settings.resize;
          if (maxWidth && width > maxWidth) {
            height = (maxWidth * height) / width;
            width = maxWidth;
          }
          if (maxHeight && height > maxHeight) {
            width = (maxHeight * width) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a formato deseado
        const quality = settings.quality ? settings.quality / 100 : 0.9;
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Error al convertir la imagen'));
            return;
          }

          const convertedFile = new File([blob], 
            `${file.name.split('.')[0]}.${targetFormat}`,
            { type: `image/${targetFormat}` }
          );

          resolve({
            file: convertedFile,
            info: {
              originalSize: file.size,
              convertedSize: blob.size,
              width,
              height,
              format: targetFormat,
              quality: quality * 100
            }
          });
        }, `image/${targetFormat}`, quality);
      };

      img.onerror = () => reject(new Error('Error al procesar la imagen'));
      img.src = URL.createObjectURL(file);
    });
  } catch (error) {
    throw new Error(`Error al convertir la imagen: ${error.message}`);
  }
};

export {
  imageSettings,
  validateImage,
  convertImage
};
