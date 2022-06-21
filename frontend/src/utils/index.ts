export const delay = (time: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, time | 1500);
  });
};