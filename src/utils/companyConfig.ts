import companyConfig from '../../company_config.json';

interface CompanyConfig {
  COMPANY_NAME: string;
}

export const getCompanyName = (): string => {
  const config = companyConfig[0] as CompanyConfig;
  return config.COMPANY_NAME || 'Advance Solutions';
};