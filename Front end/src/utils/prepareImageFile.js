const MAX_BYTES = 8 * 1024 * 1024;
const OK_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

/**
 * Validates and optionally converts an image to JPEG for upload.
 * @param {File} file
 * @returns {Promise<File>}
 */
export async function prepareImageFile(file) {
  if (!file) {
    throw new Error('NO_FILE');
  }

  if (file.size > MAX_BYTES) {
    throw new Error('FILE_TOO_LARGE');
  }

  if (OK_TYPES.has(file.type)) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const maxDim = 1920;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('CANVAS_ERROR'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error('CONVERT_FAILED'));
            return;
          }
          const name = (file.name || 'photo').replace(/\.[^.]+$/, '') + '.jpg';
          resolve(new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() }));
        },
        'image/jpeg',
        0.88
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('UNSUPPORTED_FORMAT'));
    };

    img.src = url;
  });
}
