import { getEnvironmentConfig } from './environment.config';

export interface SchedulingConfig {
  pullSourcesPollIntervalMs: number;
  pullSourcesSchedulerEnabled: boolean;
  approvalNotificationSchedulerEnabled: boolean;
}

export function getSchedulingConfig(): SchedulingConfig {
  const config = getEnvironmentConfig();

  return {
    pullSourcesPollIntervalMs: config.pullSourcesPollIntervalMs,
    pullSourcesSchedulerEnabled: config.pullSourcesSchedulerEnabled,
    approvalNotificationSchedulerEnabled: config.approvalNotificationSchedulerEnabled,
  };
}
