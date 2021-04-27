import fs from 'fs';
import moment from 'moment';
import { MessageObject } from 'npmlog';
import getStaticPath from 'utils/getStaticPath';
import getLogger from './getLogger';

const writeNewLog = () => {
  const logger = getLogger();
  const logStaticPath = getStaticPath(`logs`);
  const logFileName = `${moment().format('DD-MM-YYYY')}.txt`;

  if (!fs.existsSync(logStaticPath)) {
    fs.mkdirSync(logStaticPath);
  }

  fs.writeFileSync(
    logStaticPath + '/' + logFileName,
    formatLogMessage(logger.records[logger.records.length - 1]),
    {
      flag: 'a+'
    }
  );
};

export default writeNewLog;

const formatLogMessage = (record: MessageObject) => {
  return `${record.level} ${record.prefix} ${record.message}\n`;
};
