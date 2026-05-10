export interface SchedulingConfig {
  pullSourcesPollIntervalMs: number;
  pullSourcesSchedulerEnabled: boolean;
  approvalNotificationSchedulerEnabled: boolean;
}

export function getSchedulingConfig(): SchedulingConfig {
  return {
    pullSourcesPollIntervalMs: parseInt(process.env.PULL_SOURCES_POLL_INTERVAL_MS || '300000', 10),
    pullSourcesSchedulerEnabled: process.env.PULL_SOURCES_SCHEDULER_ENABLED !== 'false',
    approvalNotificationSchedulerEnabled: process.env.APPROVAL_NOTIFICATION_SCHEDULER_ENABLED !== 'false',
  };
}
