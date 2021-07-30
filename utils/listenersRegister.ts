import path from 'path';
import { Client } from 'discord.js';
import { getFileNames, getModules, readDir } from 'utils';
import { getLogger } from './logger';

function listenersRegister(client: Client, listenersPath: string): void {
  const logger = getLogger();
  const fileList = readDir(listenersPath);
  const fileNames = getFileNames(fileList);
  const eventHandlers = readDir(listenersPath).map(file => {
    const filePath = path.join(listenersPath, file);
    return getModules(filePath).default;
  });

  fileNames.forEach((name, index) => {
    if (name !== 'ready') {
      client.on(name, (...args) => {
        try {
          eventHandlers[index](...args);
        } catch (err) {
          logger.error(err.message);
        }
      });
    }
  });
}

export default listenersRegister;
