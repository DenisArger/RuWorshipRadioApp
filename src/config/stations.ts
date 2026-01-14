export interface RadioStation {
  id: string;
  name: string;
  streamUrl: string;
  description?: string;
}

export const stations: RadioStation[] = [
  {
    id: 'station1',
    name: 'Радиостанция 1',
    streamUrl: 'https://example.com/radio1.mp3',
    description: 'Описание первой радиостанции'
  },
  {
    id: 'station2',
    name: 'Радиостанция 2',
    streamUrl: 'https://example.com/radio2.mp3',
    description: 'Описание второй радиостанции'
  }
];

