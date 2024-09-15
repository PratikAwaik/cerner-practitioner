export interface Token {
  access_token: string;
  patient: string;
  scope: string;
  need_patient_banner: boolean;
  id_token: string;
  smart_style_url: string;
  encounter: string;
  token_type: string;
  expires_in: number;
  user: string;
  tenant: string;
  username: string;
}
