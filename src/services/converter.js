// Simulación de conversión de archivos
export const convertFile = (file, targetFormat) => {
  return new Promise((resolve) => {
    // Simulamos el proceso de conversión
    setTimeout(() => {
      // Creamos un nuevo Blob para simular el archivo convertido
      const convertedContent = new Blob([file], { type: `application/${targetFormat}` });
      
      // Creamos un nombre para el archivo convertido
      const originalName = file.name.split('.')[0];
      const convertedFileName = `${originalName}.${targetFormat}`;
      
      // Creamos un objeto File con el contenido convertido
      const convertedFile = new File([convertedContent], convertedFileName, {
        type: `application/${targetFormat}`,
      });
      
      resolve(convertedFile);
    }, 1500); // Simulamos un delay de 1.5 segundos
  });
};

// Función para descargar el archivo
export const downloadFile = (file) => {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
