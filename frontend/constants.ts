import { TaskStatus } from './types';

export const STATUS_ORDER: TaskStatus[] = [
  TaskStatus.YENI_TALEP,
  TaskStatus.DEVAM_EDIYOR,
  TaskStatus.BEKLEMEDE,
  TaskStatus.TEST_ASAMASINDA,
  TaskStatus.TAMAMLANDI,
];