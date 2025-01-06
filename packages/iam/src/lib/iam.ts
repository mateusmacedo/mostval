export type TCredentialsId = string;
export type TCredentialsSecret = string;

export interface ICredentials {
  readonly id: TCredentialsId
  readonly secret: TCredentialsSecret
}

export class InvalidCredentialsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidCredentialsError'
  }
}
