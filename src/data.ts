function filterImageFile(file: File) {
  return file.type.startsWith('image/');
}

function toImageSource(images: File[]) {
  return images
    .map((image) => {
      const url = URL.createObjectURL(image);

      return `![${image.name}](${url})`;
    })
    .join(' ');
}

export function getPlainData(e: InputEvent) {
  if (e.data) {
    return e.data;
  }

  if (!e.dataTransfer) {
    return '';
  }

  const files = e.dataTransfer.files;

  if (files && files.length) {
    const images = Array.from(files).filter(filterImageFile);

    return toImageSource(images);
  } else {
    const text = e.dataTransfer.getData('text/plain');

    return text || '';
  }
}
