export type TCredentialsId = string;
export type TCredentialsSecret = string;

export interface ICredentials {
  readonly id: TCredentialsId
  readonly secret: TCredentialsSecret
}
