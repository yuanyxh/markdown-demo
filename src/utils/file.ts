import { wrapPromise } from "./promise";

export const readFileAsText = (file: File) => {
  const fileReader = new FileReader();
  const { promise, resolve, reject } = wrapPromise<string>();

  fileReader.onload = () => {
    resolve(fileReader.result as string);
  };

  fileReader.onerror = reject;

  fileReader.readAsText(file);

  return promise;
};
