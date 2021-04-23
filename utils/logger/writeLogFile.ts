import fs from 'fs';
import moment from 'moment';
import getLogger from './getLogger';
import getStaticPath from 'utils/getStaticPath';

const writeLogToFile = () => {
  const logger = getLogger();
  const logStaticPath = getStaticPath(`logs`);
  const logFileName = `${moment().format('DD-MM-YYYY')}.txt`;

  if (!fs.existsSync(logStaticPath)) {
    fs.mkdirSync(logStaticPath);
  }

  logger.records.forEach(log => {
    fs.writeFileSync(logStaticPath + '/' + logFileName, log.message + '\n', {
      flag: 'a+'
    });
  });
};

export default writeLogToFile;
