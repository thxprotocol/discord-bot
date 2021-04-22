import path from 'path';
// import appRootPath from 'app-root-path';

const getStaticPath = (continuePath: string): string =>
  path.join(require.main?.filename || '', '..', continuePath);

export default getStaticPath;
