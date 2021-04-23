import path from 'path';
import appRootPath from 'app-root-path';

const getStaticPath = (continuePath: string): string => {
  if (process.env.JEST_WORKER_ID) {
    return path.join(appRootPath.path, continuePath);
  }
  return path.join(require.main?.filename || '', '..', continuePath);
};

export default getStaticPath;
