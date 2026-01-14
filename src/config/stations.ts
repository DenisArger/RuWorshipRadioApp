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
}

export const radioStation: RadioStation = {
  id: 'ruworship',
  name: 'Радио RuWorship',
  description: 'Песни в стиле Praise&Worship, Gospel, песни прославления и поклонения на русском языке',
  streams: [
    {
      id: 'https-256',
      bitrate: '256 кбит',
      protocol: 'HTTPS',
      streamUrl: 'https://s.ruworship.ru:8125/radio'
    },
    {
      id: 'https-128',
      bitrate: '128 кбит',
      protocol: 'HTTPS',
      streamUrl: 'https://s.ruworship.ru:8005/radio'
    },
    {
      id: 'https-96',
      bitrate: '96 кбит',
      protocol: 'HTTPS',
      streamUrl: 'https://s.ruworship.ru:8105/radio'
    },
    {
      id: 'https-64',
      bitrate: '64 кбит',
      protocol: 'HTTPS',
      streamUrl: 'https://s.ruworship.ru:8095/radio'
    },
    {
      id: 'http-128',
      bitrate: '128 кбит',
      protocol: 'HTTP',
      streamUrl: 'http://s.ruworship.ru:8000/radio'
    },
    {
      id: 'http-96',
      bitrate: '96 кбит',
      protocol: 'HTTP',
      streamUrl: 'http://s.ruworship.ru:8100/radio'
    },
    {
      id: 'http-64',
      bitrate: '64 кбит',
      protocol: 'HTTP',
      streamUrl: 'http://s.ruworship.ru:8090/radio'
    }
  ]
};

