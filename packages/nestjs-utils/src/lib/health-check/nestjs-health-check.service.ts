import { Injectable } from '@nestjs/common';
import { HealthCheckResult, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';

export interface ICheck<T> {
    check(): Promise<T>
}

@Injectable()
export class NestjsHealthCheckService implements ICheck<HealthCheckResult> {
    constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
    ) { }

    public check(): Promise<HealthCheckResult> {
        return this.health.check([
            () => this.http.pingCheck('google', 'https://google.com'),
        ]);
    }
}
