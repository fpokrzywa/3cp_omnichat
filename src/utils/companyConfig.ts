import companyConfig from '../../company_config.json';

interface CompanyConfig {
  COMPANY_NAME: string;
  COMPANY_BOT_NAME: string;
  COMPANY_LOGO: string;
}

export const getCompanyName = (): string => {
  const config = companyConfig[0] as CompanyConfig;
  return config.COMPANY_NAME || 'ADVANCE Solutions';
};

export const getCompanyBotName = (): string => {
  const config = companyConfig[0] as CompanyConfig;
  return config.COMPANY_BOT_NAME || 'Leif';
};

export const getCompanyLogo = (): string => {
  const config = companyConfig[0] as CompanyConfig;
  return config.COMPANY_LOGO || '/ADVANCE Logo_Vertical_Color.png';
};
