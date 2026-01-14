// Telegram Web App API
const tg = window.Telegram?.WebApp;

// Инициализация Telegram Web App
if (tg) {
    tg.ready();
    tg.expand();
    
    // Применение темы Telegram
    if (tg.colorScheme === 'dark') {
        document.body.classList.add('dark');
    }
    
    // Обновление цветов из Telegram
    if (tg.themeParams) {
        const root = document.documentElement;
        if (tg.themeParams.bg_color) {
            root.style.setProperty('--bg-color', tg.themeParams.bg_color);
        }
        if (tg.themeParams.text_color) {
            root.style.setProperty('--text-color', tg.themeParams.text_color);
        }
        if (tg.themeParams.button_color) {
            root.style.setProperty('--button-bg', tg.themeParams.button_color);
        }
        if (tg.themeParams.button_text_color) {
            root.style.setProperty('--button-text', tg.themeParams.button_text_color);
        }
    }
}

// Конфигурация радиостанции
const radioStation = {
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

// Состояние приложения
let currentStream = null;
let isPlaying = false;

// DOM элементы
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const playPauseIcon = document.getElementById('playPauseIcon');
const stationName = document.getElementById('stationName');
const stationStatus = document.getElementById('stationStatus');
const currentStationDisplay = document.getElementById('currentStation');
const stationsList = document.getElementById('stationsList');
const errorMessage = document.getElementById('errorMessage');

// Инициализация
function init() {
    renderStations();
    setupAudioPlayer();
    setupEventListeners();
}

// Рендеринг списка потоков
function renderStations() {
    stationsList.innerHTML = '';
    
    // Показываем описание радиостанции
    const stationInfo = document.createElement('div');
    stationInfo.className = 'station-info-header';
    stationInfo.innerHTML = `
        <div class="station-item-title">${escapeHtml(radioStation.name)}</div>
        <div class="station-item-description">${escapeHtml(radioStation.description)}</div>
    `;
    stationsList.appendChild(stationInfo);
    
    // Показываем потоки
    radioStation.streams.forEach(stream => {
        const streamItem = document.createElement('div');
        streamItem.className = 'station-item';
        if (currentStream?.id === stream.id && isPlaying) {
            streamItem.classList.add('active');
        }
        streamItem.dataset.streamId = stream.id;
        
        streamItem.innerHTML = `
            <div class="station-item-title">${escapeHtml(stream.bitrate)} (${escapeHtml(stream.protocol)})</div>
            <div class="station-item-indicator">${currentStream?.id === stream.id && isPlaying ? '🔊' : ''}</div>
        `;
        
        streamItem.addEventListener('click', () => selectStream(stream));
        stationsList.appendChild(streamItem);
    });
}

// Выбор потока
function selectStream(stream) {
    if (currentStream?.id === stream.id && isPlaying) {
        // Если выбран тот же поток и он играет, просто пауза
        togglePlayPause();
        return;
    }
    
    // Остановка текущего воспроизведения
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
    }
    
    // Установка нового потока
    currentStream = stream;
    audioPlayer.src = stream.streamUrl;
    
    // Обновление UI
    updateUI();
    renderStations();
    
    // Автоматический запуск
    play();
}

// Настройка аудио-плеера
function setupAudioPlayer() {
    audioPlayer.addEventListener('loadstart', () => {
        stationStatus.textContent = 'Загрузка...';
        playPauseBtn.disabled = true;
    });
    
    audioPlayer.addEventListener('canplay', () => {
        playPauseBtn.disabled = false;
    });
    
    audioPlayer.addEventListener('play', () => {
        isPlaying = true;
        updateUI();
    });
    
    audioPlayer.addEventListener('pause', () => {
        isPlaying = false;
        updateUI();
    });
    
    audioPlayer.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        showError('Ошибка воспроизведения. Проверьте подключение к интернету.');
        isPlaying = false;
        updateUI();
        playPauseBtn.disabled = false;
    });
    
    audioPlayer.addEventListener('waiting', () => {
        stationStatus.textContent = 'Буферизация...';
    });
    
    audioPlayer.addEventListener('playing', () => {
        stationStatus.textContent = 'Воспроизведение';
    });
    
    audioPlayer.addEventListener('stalled', () => {
        stationStatus.textContent = 'Проблема с подключением...';
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    // Обработка закрытия приложения
    if (tg) {
        tg.onEvent('viewportChanged', () => {
            tg.expand();
        });
    }
}

// Переключение воспроизведения/паузы
function togglePlayPause() {
    if (!currentStream) {
        showError('Выберите поток для воспроизведения');
        return;
    }
    
    if (isPlaying) {
        pause();
    } else {
        play();
    }
}

// Воспроизведение
function play() {
    if (!currentStream) {
        showError('Выберите поток для воспроизведения');
        return;
    }
    
    if (!audioPlayer.src) {
        audioPlayer.src = currentStream.streamUrl;
    }
    
    audioPlayer.play().catch(error => {
        console.error('Play error:', error);
        showError('Не удалось начать воспроизведение');
        isPlaying = false;
        updateUI();
    });
}

// Пауза
function pause() {
    audioPlayer.pause();
}

// Обновление UI
function updateUI() {
    if (currentStream) {
        stationName.textContent = `${radioStation.name} - ${currentStream.bitrate}`;
        currentStationDisplay.textContent = radioStation.name;
    } else {
        stationName.textContent = radioStation.name;
        currentStationDisplay.textContent = 'Выберите поток';
    }
    
    playPauseIcon.textContent = isPlaying ? '⏸️' : '▶️';
    
    if (!isPlaying && !currentStream) {
        stationStatus.textContent = 'Остановлено';
    }
}

// Показать ошибку
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Инициализация при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

