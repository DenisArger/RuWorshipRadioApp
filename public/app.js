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

// Конфигурация радиостанций
// Замените эти данные на ваши реальные ссылки на радио
const stations = [
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

// Состояние приложения
let currentStation = null;
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

// Рендеринг списка станций
function renderStations() {
    stationsList.innerHTML = '';
    
    stations.forEach(station => {
        const stationItem = document.createElement('div');
        stationItem.className = 'station-item';
        stationItem.dataset.stationId = station.id;
        
        stationItem.innerHTML = `
            <div class="station-item-title">${escapeHtml(station.name)}</div>
            ${station.description ? `<div class="station-item-description">${escapeHtml(station.description)}</div>` : ''}
            <div class="station-item-indicator">${currentStation?.id === station.id ? '🔊' : ''}</div>
        `;
        
        stationItem.addEventListener('click', () => selectStation(station));
        stationsList.appendChild(stationItem);
    });
}

// Выбор станции
function selectStation(station) {
    if (currentStation?.id === station.id && isPlaying) {
        // Если выбрана та же станция и она играет, просто пауза
        togglePlayPause();
        return;
    }
    
    // Остановка текущего воспроизведения
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
    }
    
    // Установка новой станции
    currentStation = station;
    audioPlayer.src = station.streamUrl;
    
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
    if (!currentStation) {
        showError('Выберите станцию для воспроизведения');
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
    if (!currentStation) {
        showError('Выберите станцию для воспроизведения');
        return;
    }
    
    if (!audioPlayer.src) {
        audioPlayer.src = currentStation.streamUrl;
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
    if (currentStation) {
        stationName.textContent = currentStation.name;
        currentStationDisplay.textContent = currentStation.name;
    } else {
        stationName.textContent = '-';
        currentStationDisplay.textContent = 'Выберите станцию';
    }
    
    playPauseIcon.textContent = isPlaying ? '⏸️' : '▶️';
    
    if (!isPlaying && !currentStation) {
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

