// DOM 요소 가져오기
const currentDateElement = document.getElementById('current-date');
const temperatureElement = document.getElementById('temperature');
const weatherDescriptionElement = document.getElementById('weather-description');
const weatherIconElement = document.getElementById('weather-icon');
const feelsLikeElement = document.getElementById('feels-like');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');
const pressureElement = document.getElementById('pressure');
const hourlyForecastElement = document.getElementById('hourly-forecast');
const clothingRecommendationText = document.getElementById('clothing-recommendation-text');
const prevHourButton = document.getElementById('prev-hour');
const nextHourButton = document.getElementById('next-hour');
const dailyForecastElement = document.getElementById('daily-forecast');
const prevDayButton = document.getElementById('prev-day');
const nextDayButton = document.getElementById('next-day');

// 마지막 업데이트 시간 관리
let lastUpdateTime = null;

// 현재 날짜 표시
function displayCurrentDate() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long' 
    };
    currentDateElement.textContent = now.toLocaleDateString('ko-KR', options);
}

// 날씨 API 오류 방지를 위해 샘플 데이터 사용
function useSampleData() {
    const sampleData = {
        weather: [{ description: '맑음', icon: '01d' }],
        main: {
            temp: 21,
            feels_like: 22,
            humidity: 65,
            pressure: 1012
        },
        wind: {
            speed: 3.5
        }
    };
    
    displayWeatherData(sampleData);
    weatherDescriptionElement.textContent += ' (샘플 데이터)';
    
    // 샘플 시간별 데이터 생성
    const sampleHourlyData = generateSampleHourlyData();
    displayHourlyForecast(sampleHourlyData);
    
    // 샘플 일별 데이터 생성
    const sampleDailyData = generateSampleDailyData();
    displayDailyForecast(sampleDailyData);
}

// 샘플 시간별 데이터 생성
function generateSampleHourlyData() {
    const now = new Date();
    // 시간별 아이콘과 온도를 고정값으로 설정
    const sampleHourlyData = [
        { icon: '01d', temp: 21 }, // 맑음
        { icon: '01d', temp: 22 },
        { icon: '02d', temp: 22 }, // 약간 구름
        { icon: '02d', temp: 23 },
        { icon: '03d', temp: 23 }, // 구름 많음
        { icon: '03d', temp: 22 },
        { icon: '04d', temp: 21 }, // 흐림
        { icon: '04d', temp: 20 },
        { icon: '10d', temp: 19 }, // 비
        { icon: '10d', temp: 18 },
        { icon: '01d', temp: 19 }, // 맑음
        { icon: '01d', temp: 20 },
        { icon: '01n', temp: 19 }, // 맑은 밤
        { icon: '01n', temp: 18 },
        { icon: '02n', temp: 17 }, // 약간 구름 (밤)
        { icon: '02n', temp: 17 },
        { icon: '03n', temp: 16 }, // 구름 많음 (밤)
        { icon: '03n', temp: 16 },
        { icon: '04n', temp: 15 }, // 흐림 (밤)
        { icon: '04n', temp: 15 },
        { icon: '01n', temp: 14 }, // 맑은 밤
        { icon: '01n', temp: 14 },
        { icon: '01n', temp: 14 },
        { icon: '01n', temp: 13 }
    ];
    
    const hourlyData = [];
    
    // 현재 시간부터 24시간 데이터 생성
    for (let i = 0; i < 24; i++) {
        const forecastTime = new Date(now.getTime() + i * 60 * 60 * 1000);
        hourlyData.push({
            dt: forecastTime.getTime() / 1000,
            temp: sampleHourlyData[i].temp,
            weather: [{ icon: sampleHourlyData[i].icon }]
        });
    }
    
    return hourlyData;
}

// 샘플 일별 데이터 생성
function generateSampleDailyData() {
    const now = new Date();
    // 일별 아이콘, 최저/최고 온도 설정
    const sampleDailyData = [
        { icon: '01d', min: 18, max: 24 }, // 오늘 - 맑음
        { icon: '02d', min: 17, max: 25 }, // 내일 - 약간 구름
        { icon: '03d', min: 16, max: 22 }, // 모레 - 구름 많음
        { icon: '10d', min: 15, max: 19 }, // 비
        { icon: '01d', min: 16, max: 21 }, // 맑음
        { icon: '01d', min: 17, max: 23 }, // 맑음
        { icon: '02d', min: 18, max: 24 }  // 약간 구름
    ];
    
    const dailyData = [];
    
    // 오늘부터 7일간 데이터 생성
    for (let i = 0; i < 7; i++) {
        const forecastDate = new Date(now);
        forecastDate.setDate(now.getDate() + i);
        
        dailyData.push({
            dt: forecastDate.getTime() / 1000,
            temp: {
                min: sampleDailyData[i].min,
                max: sampleDailyData[i].max
            },
            weather: [{ icon: sampleDailyData[i].icon }]
        });
    }
    
    return dailyData;
}

// OpenWeatherMap API에서 날씨 데이터 가져오기
async function fetchWeatherData() {
    try {
        // OpenWeatherMap API 키 (무료 사용 가능한 샘플 키)
        const apiKey = '9fd7a449d055dba26a982a3220f32aa2';
        
        // API 키가 기본값이면 샘플 데이터 사용
        if (apiKey === 'YOUR_API_KEY_HERE') {
            console.log('API 키가 설정되지 않아 샘플 데이터를 사용합니다.');
            useSampleData();
            return;
        }
        
        const city = 'Busan'; // 부산
        const lang = 'kr'; // 한국어 응답

        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&lang=${lang}&units=metric`;
        
        // API 요청
        const response = await fetch(apiUrl);
        
        // 응답 확인
        if (!response.ok) {
            throw new Error('날씨 데이터를 가져오는데 실패했습니다.');
        }
        
        // JSON 데이터 파싱
        const data = await response.json();
        displayWeatherData(data);
        updateClothingRecommendation(data.main.temp, data.weather[0].icon);
        
        // 위치 정보를 이용해 시간별 및 일별 예보 데이터 가져오기
        await fetchOneCallData(apiKey, data.coord.lat, data.coord.lon);
        
        // 마지막 업데이트 시간 기록
        lastUpdateTime = new Date();
        updateLastUpdateTimeText();
    } catch (error) {
        console.error('에러:', error);
        weatherDescriptionElement.textContent = '날씨 데이터를 불러올 수 없습니다.';
        // 에러 발생 시 샘플 데이터 사용
        useSampleData();
    }
}

// OneCall API를 이용해 시간별 및 일별 예보 가져오기
async function fetchOneCallData(apiKey, lat, lon) {
    try {
        // OneCall API를 이용해 시간별 및 일별 예보 가져오기
        const apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,alerts&appid=${apiKey}&units=metric&lang=kr`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error('날씨 예보 데이터를 가져오는데 실패했습니다.');
        }
        
        const data = await response.json();
        
        // 시간별 및 일별 데이터 표시
        displayHourlyForecast(data.hourly);
        displayDailyForecast(data.daily);
    } catch (error) {
        console.error('날씨 예보 에러:', error);
        // 에러 발생 시 샘플 데이터 사용
        const sampleHourlyData = generateSampleHourlyData();
        const sampleDailyData = generateSampleDailyData();
        displayHourlyForecast(sampleHourlyData);
        displayDailyForecast(sampleDailyData);
    }
}

// 시간별 날씨 예보 가져오기 (이전 함수는 삭제)
// async function fetchHourlyForecast(apiKey, lat, lon) { ... }

// 시간별 날씨 데이터 표시
function displayHourlyForecast(hourlyData) {
    // 기존 데이터 초기화
    hourlyForecastElement.innerHTML = '';
    
    // 처음 24시간만 표시 (하루)
    const forecastsToShow = hourlyData.slice(0, 24);
    
    forecastsToShow.forEach(item => {
        const dateTime = new Date(item.dt * 1000);
        const hour = dateTime.getHours();
        const temp = Math.round(item.temp);
        const iconCode = item.weather[0].icon;
        
        // 시간별 날씨 아이템 생성
        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'hourly-item';
        
        // 시간 표시 (한국식 AM/PM)
        let timeText;
        if (hour === 0) {
            timeText = '오전 12시';
        } else if (hour < 12) {
            timeText = `오전 ${hour}시`;
        } else if (hour === 12) {
            timeText = '오후 12시';
        } else {
            timeText = `오후 ${hour - 12}시`;
        }
        
        // 아이템 내용 생성
        hourlyItem.innerHTML = `
            <span class="hourly-time">${timeText}</span>
            <img class="hourly-icon" src="https://openweathermap.org/img/wn/${iconCode}.png" alt="날씨 아이콘">
            <span class="hourly-temp">${temp}°C</span>
        `;
        
        hourlyForecastElement.appendChild(hourlyItem);
    });
    
    // 화살표 버튼 이벤트 리스너 설정
    setupHourlyNavButtons();
}

// 일별 날씨 데이터 표시
function displayDailyForecast(dailyData) {
    // 기존 데이터 초기화
    dailyForecastElement.innerHTML = '';
    
    // 7일 데이터 표시
    const forecastsToShow = dailyData.slice(0, 7);
    
    // 요일 이름
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    
    forecastsToShow.forEach((item, index) => {
        const dateTime = new Date(item.dt * 1000);
        const dayOfWeek = weekdays[dateTime.getDay()];
        const day = dateTime.getDate();
        const month = dateTime.getMonth() + 1;
        const iconCode = item.weather[0].icon;
        
        // 최저/최고 온도
        let minTemp, maxTemp;
        
        // OneCall API와 샘플 데이터의 온도 구조가 다르므로 처리
        if (item.temp.min !== undefined) {
            minTemp = Math.round(item.temp.min);
            maxTemp = Math.round(item.temp.max);
        } else if (item.temp.day !== undefined) {
            // 이전 API 버전의 경우
            minTemp = Math.round(item.temp.min);
            maxTemp = Math.round(item.temp.max);
        } else {
            // 기본값 지정
            minTemp = Math.round(item.temp) - 3;
            maxTemp = Math.round(item.temp) + 3;
        }
        
        // 일별 날씨 아이템 생성
        const dailyItem = document.createElement('div');
        dailyItem.className = 'daily-item';
        
        // 오늘인 경우 "오늘"로 표시
        let dateText;
        if (index === 0) {
            dateText = '오늘';
        } else if (index === 1) {
            dateText = '내일';
        } else {
            dateText = `${month}/${day}(${dayOfWeek})`;
        }
        
        // 아이템 내용 생성
        dailyItem.innerHTML = `
            <span class="daily-date">${dateText}</span>
            <img class="daily-icon" src="https://openweathermap.org/img/wn/${iconCode}.png" alt="날씨 아이콘">
            <span class="daily-temp">${maxTemp}°C</span>
            <span class="daily-temp-range">${minTemp}°C ~ ${maxTemp}°C</span>
        `;
        
        dailyForecastElement.appendChild(dailyItem);
    });
    
    // 화살표 버튼 이벤트 리스너 설정
    setupDailyNavButtons();
}

// 화살표 버튼 이벤트 설정 (시간별)
function setupHourlyNavButtons() {
    // 이전에 등록된 이벤트를 제거
    prevHourButton.removeEventListener('click', navigateHourPrev);
    nextHourButton.removeEventListener('click', navigateHourNext);
    
    // 각 아이템의 정확한 너비 계산
    const hourlyItems = hourlyForecastElement.querySelectorAll('.hourly-item');
    if (hourlyItems.length === 0) return;
    
    // 첫 번째 아이템의 전체 너비 계산 (내부 너비 + 마진 + 패딩 + 경계선)
    const firstItem = hourlyItems[0];
    const itemStyle = window.getComputedStyle(firstItem);
    const itemWidth = firstItem.offsetWidth + 
                     parseInt(itemStyle.marginLeft, 10) + 
                     parseInt(itemStyle.marginRight, 10);
    
    // 컨테이너 너비와 한 화면에 보이는 아이템 수 계산
    const containerWidth = hourlyForecastElement.offsetWidth;
    const visibleItems = Math.floor(containerWidth / itemWidth);
    
    // 현재 표시된 첫 번째 아이템의 인덱스 추적
    let currentIndex = 0;
    
    // 이전 버튼 클릭 핸들러
    function navigateHourPrev() {
        // 이전 항목들로 이동 (완전한 페이지 단위로)
        currentIndex = Math.max(0, currentIndex - visibleItems);
        scrollToIndex(currentIndex);
    }
    
    // 다음 버튼 클릭 핸들러
    function navigateHourNext() {
        // 전체 아이템의 수를 넘지 않도록 제한
        const maxStartIndex = Math.max(0, hourlyItems.length - visibleItems);
        currentIndex = Math.min(maxStartIndex, currentIndex + visibleItems);
        scrollToIndex(currentIndex);
    }
    
    // 특정 인덱스로 스크롤
    function scrollToIndex(index) {
        // 정확한 스크롤 위치 계산 (아이템 너비 * 인덱스)
        const scrollPos = itemWidth * index;
        
        hourlyForecastElement.scrollTo({
            left: scrollPos,
            behavior: 'smooth'
        });
        
        // 버튼 상태 업데이트
        setTimeout(updateButtonStates, 300);
    }
    
    // 버튼 상태 업데이트
    function updateButtonStates() {
        // 스크롤 위치 기반으로 현재 인덱스 추정
        currentIndex = Math.round(hourlyForecastElement.scrollLeft / itemWidth);
        
        // 시작 또는 끝에 있는지 확인
        const isAtStart = currentIndex <= 0;
        const isAtEnd = currentIndex >= hourlyItems.length - visibleItems;
        
        // 버튼 상태 업데이트
        prevHourButton.style.opacity = isAtStart ? '0.5' : '1';
        prevHourButton.style.cursor = isAtStart ? 'default' : 'pointer';
        prevHourButton.disabled = isAtStart;
        
        nextHourButton.style.opacity = isAtEnd ? '0.5' : '1';
        nextHourButton.style.cursor = isAtEnd ? 'default' : 'pointer';
        nextHourButton.disabled = isAtEnd;
    }
    
    // 이벤트 리스너 등록
    prevHourButton.addEventListener('click', navigateHourPrev);
    nextHourButton.addEventListener('click', navigateHourNext);
    
    // 스크롤 이벤트에서도 버튼 상태 업데이트
    hourlyForecastElement.addEventListener('scroll', updateButtonStates);
    
    // 초기 버튼 상태 설정
    updateButtonStates();
}

// 화살표 버튼 이벤트 설정 (일별)
function setupDailyNavButtons() {
    // 이전에 등록된 이벤트를 제거
    prevDayButton.removeEventListener('click', navigateDayPrev);
    nextDayButton.removeEventListener('click', navigateDayNext);
    
    // 각 아이템의 정확한 너비 계산
    const dailyItems = dailyForecastElement.querySelectorAll('.daily-item');
    if (dailyItems.length === 0) return;
    
    // 첫 번째 아이템의 전체 너비 계산 (내부 너비 + 마진 + 패딩 + 경계선)
    const firstItem = dailyItems[0];
    const itemStyle = window.getComputedStyle(firstItem);
    const itemWidth = firstItem.offsetWidth + 
                     parseInt(itemStyle.marginLeft, 10) + 
                     parseInt(itemStyle.marginRight, 10);
    
    // 컨테이너 너비와 한 화면에 보이는 아이템 수 계산
    const containerWidth = dailyForecastElement.offsetWidth;
    const visibleItems = Math.floor(containerWidth / itemWidth);
    
    // 현재 표시된 첫 번째 아이템의 인덱스 추적
    let currentIndex = 0;
    
    // 이전 버튼 클릭 핸들러
    function navigateDayPrev() {
        // 이전 항목들로 이동 (완전한 페이지 단위로)
        currentIndex = Math.max(0, currentIndex - visibleItems);
        scrollToIndex(currentIndex);
    }
    
    // 다음 버튼 클릭 핸들러
    function navigateDayNext() {
        // 전체 아이템의 수를 넘지 않도록 제한
        const maxStartIndex = Math.max(0, dailyItems.length - visibleItems);
        currentIndex = Math.min(maxStartIndex, currentIndex + visibleItems);
        scrollToIndex(currentIndex);
    }
    
    // 특정 인덱스로 스크롤
    function scrollToIndex(index) {
        // 정확한 스크롤 위치 계산 (아이템 너비 * 인덱스)
        const scrollPos = itemWidth * index;
        
        dailyForecastElement.scrollTo({
            left: scrollPos,
            behavior: 'smooth'
        });
        
        // 버튼 상태 업데이트
        setTimeout(updateButtonStates, 300);
    }
    
    // 버튼 상태 업데이트
    function updateButtonStates() {
        // 스크롤 위치 기반으로 현재 인덱스 추정
        currentIndex = Math.round(dailyForecastElement.scrollLeft / itemWidth);
        
        // 시작 또는 끝에 있는지 확인
        const isAtStart = currentIndex <= 0;
        const isAtEnd = currentIndex >= dailyItems.length - visibleItems;
        
        // 버튼 상태 업데이트
        prevDayButton.style.opacity = isAtStart ? '0.5' : '1';
        prevDayButton.style.cursor = isAtStart ? 'default' : 'pointer';
        prevDayButton.disabled = isAtStart;
        
        nextDayButton.style.opacity = isAtEnd ? '0.5' : '1';
        nextDayButton.style.cursor = isAtEnd ? 'default' : 'pointer';
        nextDayButton.disabled = isAtEnd;
    }
    
    // 이벤트 리스너 등록
    prevDayButton.addEventListener('click', navigateDayPrev);
    nextDayButton.addEventListener('click', navigateDayNext);
    
    // 스크롤 이벤트에서도 버튼 상태 업데이트
    dailyForecastElement.addEventListener('scroll', updateButtonStates);
    
    // 초기 버튼 상태 설정
    updateButtonStates();
}

// 날씨에 따른 옷차림 추천
function updateClothingRecommendation(temp, iconCode) {
    const weatherType = iconCode.substring(0, 2);
    let recommendation = '';
    let clothingOptions = [];
    
    // 온도에 따른 추천
    if (temp >= 28) {
        recommendation = '매우 더운 날씨입니다.';
        clothingOptions = [
            '얇은 민소매 티셔츠나 반팔 티셔츠가 좋겠습니다.',
            '통풍이 잘 되는 린넨 소재 옷을 추천합니다.',
            '나시티와 반바지 조합이 시원하겠습니다.',
            '땀 흡수가 잘 되는 기능성 티셔츠도 좋은 선택입니다.',
            '모자와 선글라스로 자외선을 차단하세요.'
        ];
    } else if (temp >= 23) {
        recommendation = '따뜻한 날씨입니다.';
        clothingOptions = [
            '반팔 티셔츠나 얇은 셔츠가 적당합니다.',
            '가벼운 면바지나 반바지를 입어도 좋겠습니다.',
            '여름용 얇은 원피스도 좋은 선택입니다.',
            '얇은 가디건을 준비해두면 실내 냉방에 대비할 수 있습니다.',
            '통풍이 잘 되는 운동화가 편안하겠습니다.'
        ];
    } else if (temp >= 20) {
        recommendation = '쾌적한 날씨입니다.';
        clothingOptions = [
            '얇은 긴팔 티셔츠나, 반팔에 가디건 조합이 좋겠습니다.',
            '면 소재 후드티도 편안하게 입을 수 있습니다.',
            '얇은 청바지나 면바지가 적당합니다.',
            '가벼운 점퍼나 바람막이를 챙겨가세요.',
            '밤에는 쌀쌀해질 수 있으니 얇은 겉옷을 준비하세요.'
        ];
    } else if (temp >= 17) {
        recommendation = '선선한 날씨입니다.';
        clothingOptions = [
            '얇은 니트나 맨투맨을 입기 좋은 날씨입니다.',
            '가디건이나 얇은 자켓을 겉옷으로 추천합니다.',
            '데님 자켓도 좋은 선택입니다.',
            '후드티에 청바지 조합이 편안하겠습니다.',
            '바람이 불면 쌀쌀할 수 있으니 스카프를 준비하세요.'
        ];
    } else if (temp >= 12) {
        recommendation = '쌀쌀한 날씨입니다.';
        clothingOptions = [
            '트렌치코트나 가벼운 코트를 입기 좋은 날씨입니다.',
            '니트 위에 자켓이나 가디건을 겹쳐 입으세요.',
            '내복이나 히트텍 같은 보온 이너웨어를 추천합니다.',
            '기모 후드티와 청바지 조합도 따뜻하겠습니다.',
            '목도리를 두르면 더 따뜻하게 지낼 수 있습니다.'
        ];
    } else if (temp >= 9) {
        recommendation = '제법 추운 날씨입니다.';
        clothingOptions = [
            '코트나 패딩 점퍼를 입는 것이 좋겠습니다.',
            '두꺼운 니트나 후리스를 입으세요.',
            '히트텍 같은 발열 내의가 필수적입니다.',
            '기모 바지나 두꺼운 청바지가 적당합니다.',
            '목도리와 장갑을 준비하세요.'
        ];
    } else if (temp >= 5) {
        recommendation = '꽤 추운 날씨입니다.';
        clothingOptions = [
            '두꺼운 패딩이나 다운 코트를 착용하세요.',
            '내복과 히트텍을 겹쳐 입는 것이 좋습니다.',
            '목도리, 장갑, 모자로 체온을 보호하세요.',
            '귀마개나 털모자로 귀를 따뜻하게 보호하세요.',
            '기모 이너와 두꺼운 니트를 겹쳐 입으세요.'
        ];
    } else {
        recommendation = '매우 추운 날씨입니다.';
        clothingOptions = [
            '두꺼운 롱패딩이나 방한용 다운 코트가 필수입니다.',
            '여러 겹 레이어드 스타일로 옷을 겹쳐 입으세요.',
            '발열 내의와 두꺼운 니트를 겹쳐 입으세요.',
            '방한용 장갑, 목도리, 털모자를 모두 착용하세요.',
            '방한 부츠와 두꺼운 양말로 발을 따뜻하게 보호하세요.'
        ];
    }
    
    // 날씨 상태에 따른 추가 추천
    let weatherSpecificAdvice = '';
    if (weatherType === '09' || weatherType === '10') {
        weatherSpecificAdvice = ' 비가 오니 우산과 방수 재킷을 꼭 챙기세요. 방수가 되는 신발을 신는 것도 좋습니다.';
    } else if (weatherType === '11') {
        weatherSpecificAdvice = ' 천둥 번개가 치니 우산보다는 방수 재킷이나 비옷을 입고, 가능하면 외출을 삼가세요.';
    } else if (weatherType === '13') {
        weatherSpecificAdvice = ' 눈이 오니 방수와 보온이 되는 신발과 외투를 착용하세요. 미끄럼 방지 신발이 좋습니다.';
    } else if (weatherType === '50') {
        weatherSpecificAdvice = ' 안개가 짙으니 운전 시 주의하세요. 밝은 색상의 옷을 입으면 안전에 도움이 됩니다.';
    } else if (weatherType === '01' && temp >= 21) {
        weatherSpecificAdvice = ' 맑고 햇빛이 강하니 자외선 차단제를 바르고, 모자나 선글라스를 착용하세요.';
    }
    
    // 랜덤하게 옷차림 추천 2개 선택
    const selectedOptions = [];
    if (clothingOptions.length > 0) {
        // 중복되지 않는 두 개의 인덱스 선택
        const index1 = Math.floor(Math.random() * clothingOptions.length);
        let index2 = Math.floor(Math.random() * clothingOptions.length);
        while (index1 === index2 && clothingOptions.length > 1) {
            index2 = Math.floor(Math.random() * clothingOptions.length);
        }
        
        selectedOptions.push(clothingOptions[index1]);
        if (index1 !== index2) {
            selectedOptions.push(clothingOptions[index2]);
        }
    }
    
    // 최종 추천 텍스트 구성
    let finalRecommendation = recommendation;
    if (selectedOptions.length > 0) {
        finalRecommendation += ' ' + selectedOptions.join(' ');
    }
    
    finalRecommendation += weatherSpecificAdvice;
    
    clothingRecommendationText.textContent = finalRecommendation;
}

// 마지막 업데이트 시간 표시
function updateLastUpdateTimeText() {
    if (lastUpdateTime) {
        const timeStr = lastUpdateTime.toLocaleTimeString('ko-KR');
        
        // 이미 마지막 업데이트 시간 요소가 있는지 확인
        let updateTimeElement = document.getElementById('last-update-time');
        
        if (!updateTimeElement) {
            // 없으면 새로 생성
            updateTimeElement = document.createElement('p');
            updateTimeElement.id = 'last-update-time';
            updateTimeElement.style.fontSize = '12px';
            updateTimeElement.style.color = '#666';
            updateTimeElement.style.textAlign = 'center';
            updateTimeElement.style.marginTop = '10px';
            document.querySelector('main').appendChild(updateTimeElement);
        }
        
        updateTimeElement.textContent = `마지막 업데이트: ${timeStr}`;
    }
}

// 날씨 데이터 화면에 표시
function displayWeatherData(data) {
    // 온도와 날씨 설명
    temperatureElement.textContent = Math.round(data.main.temp);
    weatherDescriptionElement.textContent = data.weather[0].description;
    
    // 날씨 아이콘
    const iconCode = data.weather[0].icon;
    weatherIconElement.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    // 추가 정보
    feelsLikeElement.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidityElement.textContent = `${data.main.humidity}%`;
    windSpeedElement.textContent = `${data.wind.speed} m/s`;
    pressureElement.textContent = `${data.main.pressure} hPa`;
    
    // 옷차림 추천 업데이트
    updateClothingRecommendation(data.main.temp, data.weather[0].icon);
}

// 자동 업데이트 함수 (1시간마다)
function setupAutoUpdate() {
    // 1시간(3600000 밀리초)마다 업데이트
    const oneHourInMs = 3600000;
    
    // 자동 업데이트 설정
    setInterval(() => {
        console.log('1시간이 지나 날씨 데이터를 업데이트합니다.');
        fetchWeatherData();
    }, oneHourInMs);
    
    // 카운트다운 타이머 설정
    setInterval(updateCountdown, 1000);
}

// 다음 업데이트까지 남은 시간 표시
function updateCountdown() {
    if (!lastUpdateTime) return;
    
    const now = new Date();
    const oneHourInMs = 3600000;
    const nextUpdateTime = new Date(lastUpdateTime.getTime() + oneHourInMs);
    const remainingTime = nextUpdateTime - now;
    
    if (remainingTime <= 0) return;
    
    // 남은 시간 계산
    const minutes = Math.floor((remainingTime / 1000 / 60) % 60);
    const seconds = Math.floor((remainingTime / 1000) % 60);
    
    // 카운트다운 요소 확인
    let countdownElement = document.getElementById('next-update-countdown');
    
    if (!countdownElement) {
        // 없으면 새로 생성
        countdownElement = document.createElement('p');
        countdownElement.id = 'next-update-countdown';
        countdownElement.style.fontSize = '12px';
        countdownElement.style.color = '#666';
        countdownElement.style.textAlign = 'center';
        
        // 마지막 업데이트 시간 요소 다음에 추가
        const lastUpdateElement = document.getElementById('last-update-time');
        if (lastUpdateElement) {
            lastUpdateElement.after(countdownElement);
        } else {
            document.querySelector('main').appendChild(countdownElement);
        }
    }
    
    // 남은 시간 형식 지정
    const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    countdownElement.textContent = `다음 업데이트까지: ${timeFormatted}`;
}

// 페이지 로드 시 실행
window.addEventListener('DOMContentLoaded', () => {
    displayCurrentDate();
    fetchWeatherData();
    setupAutoUpdate();
}); 
