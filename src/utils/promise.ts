export const wrapPromise = <T>() => {
  let resolve!: (value: T) => any;
  let reject!: (resaon: any) => any;

  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return { promise, resolve, reject };
};
