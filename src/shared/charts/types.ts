import type { ApexOptions } from 'apexcharts';

export type ChartType = 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radialBar';

export interface ChartConfig {
  type: ChartType;
  options: ApexOptions;
}

