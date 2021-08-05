import getPrefix from './getPrefix';

interface Props {
  name: string;
  desc: string;
  childs?: string[];
  params?: string[];
  example?: string;
  path?: string;
}

const paramsFormatter = (params: string[]) =>
  params.map(param => `<${param}>`).join(' ');

const usageGenerate = ({
  name,
  desc,
  path,
  params,
  example,
  childs
}: Props): string => {
  let usageString = '';

  usageString += `**Command**: ${name}\n`;
  usageString += `**Description**: ${desc}\n`;

  if (params && path) {
    usageString += `**Usage**: \`${getPrefix()}${path} ${paramsFormatter(
      params
    )}\`\n`;
  }

  if (childs) {
    const childStr = childs.map(child => `\`${child}\``);

    usageString += `**Nested commands**: ${childStr.join(', ')}\n`;
  }

  if (example) {
    usageString += `**Example**: \`${getPrefix()}${example}\`\n`;
  }
  return usageString;
};

export default usageGenerate;
