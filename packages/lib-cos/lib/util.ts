import dayjs from 'dayjs';
import { nanoid } from 'nanoid';

export const generateFileKey = (ext: string) => {
  const date = dayjs().format('YYYYMMDD');
  return `${date}/${nanoid()}.${ext}`;
};
