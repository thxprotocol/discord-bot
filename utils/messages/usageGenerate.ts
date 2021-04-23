import embedGenerator from 'utils/embed';
import getPrefix from './getPrefix';

interface Props {
  name: string;
  desc: string;
  params?: string[];
  path?: string;
  example?: string;
}

const paramsFormatter = (params: string[]) =>
  params.map(param => `<${param}>`).join(' ');

const usageGenerate = ({ name, desc, path, params, example }: Props) => {
  const embed = embedGenerator({});
  embed.setTitle(`**Command**: ${name}`);
  embed.addField('**Description**', `\`${desc}\``);
  if (params && path) {
    embed.addField(
      '**Usage**',
      `\`${getPrefix()}${path} ${paramsFormatter(params)}\``
    );
  }
  if (example) {
    embed.addField('**Example**', `\`${getPrefix()}${example}\``);
  }
  return embed;
};

export default usageGenerate;
