// childProcessMock.js
export const exec = (command, callback) => {
  console.warn(`Mocked 'exec' called with command: ${command}`);
  callback(null, 'Mocked output', '');
};

export const spawn = () => {
  throw new Error('spawn is not supported in the browser.');
};

export const fork = () => {
  throw new Error('fork is not supported in the browser.');
};

// Add other methods as needed
