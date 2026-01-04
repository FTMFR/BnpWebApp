import { ref, computed, type Ref } from 'vue';
import type { ApexOptions } from 'apexcharts';

export function useChart(options: Ref<ApexOptions> | ApexOptions) {
  const chartOptions = ref<ApexOptions>(
    typeof options === 'object' && 'value' in options ? options.value : options
  );

  const updateOptions = (newOptions: Partial<ApexOptions>) => {
    chartOptions.value = { ...chartOptions.value, ...newOptions };
  };

  const updateSeries = (series: ApexOptions['series']) => {
    chartOptions.value = { ...chartOptions.value, series };
  };

  return {
    chartOptions: computed(() => chartOptions.value),
    updateOptions,
    updateSeries,
  };
}

