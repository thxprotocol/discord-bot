import getPrefix from './getPrefix';

const isCommand = (message: string): boolean => {
  const prefix = getPrefix();
  if (prefix === '') {
    throw Error('No prefix setted');
  } // Edge cases

  return message.startsWith(prefix);
};

export default isCommand;
