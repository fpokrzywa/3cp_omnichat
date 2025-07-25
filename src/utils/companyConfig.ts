import companyConfig from '../../company_config.json';

interface CompanyConfig {
  COMPANY_NAME: string;
  COMPANY_BOT_NAME: string;
}

export const getCompanyName = (): string => {
  const config = companyConfig[0] as CompanyConfig;
  return config.COMPANY_NAME || 'AgenticWeaver';
};

export const getCompanyBotName = (): string => {
  const config = companyConfig[0] as CompanyConfig;
  return config.COMPANY_BOT_NAME || 'Leif';
};