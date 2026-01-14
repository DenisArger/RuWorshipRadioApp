export interface RadioStream {
  id: string;
  bitrate: string;
  protocol: 'HTTPS' | 'HTTP';
  streamUrl: string;
}

export interface RadioStation {
  id: string;
  name: string;
  description: string;
  streams: RadioStream[];
  apiBaseUrl?: string;
  serverId?: number;
}

export const radioStation: RadioStation = {
  id: 'ruworship',
  name: 'Радио RuWorship',
  description: 'Песни в стиле Praise&Worship, Gospel, песни прославления и поклонения на русском языке',
  apiBaseUrl: 'https://62.109.26.147:3578', // URL панели управления radio-tochka.com
  serverId: 1, // ID сервера в панели управления
  streams: [
    {
      id: 'https-256',
      bitrate: '256 кбит',
      protocol: 'HTTPS',
      streamUrl: 'https://62.109.26.147:8125/radio'
    },
    {
      id: 'https-128',
      bitrate: '128 кбит',
      protocol: 'HTTPS',
      streamUrl: 'https://62.109.26.147:8005/radio'
    },
    {
      id: 'https-96',
      bitrate: '96 кбит',
      protocol: 'HTTPS',
      streamUrl: 'https://62.109.26.147:8105/radio'
    },
    {
      id: 'https-64',
      bitrate: '64 кбит',
      protocol: 'HTTPS',
      streamUrl: 'https://62.109.26.147:8095/radio'
    },
    {
      id: 'http-128',
      bitrate: '128 кбит',
      protocol: 'HTTP',
      streamUrl: 'http://62.109.26.147:8000/radio'
    },
    {
      id: 'http-96',
      bitrate: '96 кбит',
      protocol: 'HTTP',
      streamUrl: 'http://62.109.26.147:8100/radio'
    },
    {
      id: 'http-64',
      bitrate: '64 кбит',
      protocol: 'HTTP',
      streamUrl: 'http://62.109.26.147:8090/radio'
    }
  ]
};

