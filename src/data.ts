export function getPlainData(e: InputEvent) {
  if (e.data) {
    return e.data;
  }

  if (!e.dataTransfer) {
    return "";
  }

  const files = e.dataTransfer.files;

  if (files && files.length) {
  } else {
    const text = e.dataTransfer.getData("text/plain");

    return text || "";
  }

  return "";
}
