import getPrefix from './getPrefix';

const isCommand = (message: string, defaultPrefix?: string): boolean => {
  const prefix = defaultPrefix === undefined ? getPrefix() : defaultPrefix;
  if (prefix === '') {
    throw Error('No prefix setted');
  } // Edge cases

  return message.startsWith(prefix);
};

export default isCommand;
