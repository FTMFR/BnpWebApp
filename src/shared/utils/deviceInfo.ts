// src/utils/deviceInfo.ts
import { UAParser } from 'ua-parser-js';

const browserMap: Record<string, string> = {
  'Chrome': 'کروم',
  'Firefox': 'فایرفاکس',
  'Safari': 'سافاری',
  'Edge': 'اج',
  'Opera': 'اپرا',
};

export const getDeviceInfo = (userAgent: string) => {
  if (!userAgent) return 'دستگاه نامشخص';

  // Use as function to avoid the error
  const result = UAParser(userAgent);

  const browserName = result.browser.name || 'ناشناخته';
  const osName = result.os.name || 'ناشناخته';
  const osVersion = result.os.version || '';

  const faBrowser = browserMap[browserName] || browserName;

  return `${faBrowser}، ${osName} ${osVersion}`;
};
