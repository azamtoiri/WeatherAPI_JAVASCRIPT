const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'http://127.0.0.1:3000'; // Замените на адрес вашего сервера


// Тест для проверки доступности корневого пути
test('GET /', async () => {
    const response = await axios.get(BASE_URL);
    expect(response.status).toBe(200);

    // Проверка наличия ожидаемых элементов или текста на странице
    const $ = cheerio.load(response.data);
    expect($('h1').length).toBeGreaterThan(0); // Пример: ожидаем наличие хотя бы одного заголовка h1
    expect($('h1').text()).toBe('WEATHER API'); // Пример: ожидаемый текст заголовка h1

});

// Тест для проверки доступности эндпоинта /weather
test('GET /weather TEST endpoint is available', async () => {
    const response = await axios.get(`${BASE_URL}/weather`);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.length).toBeGreaterThan(0);
});

// Тест для проверки эндпоинта /weather
test('POST /weather TEST post request to the endpoint', async () => {
    const response = await axios.post(`${BASE_URL}/weather`, { city: 'Moscow' });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data) && response.data.length > 0).toBe(true);
});

// GET TEST
test('GET /weather TEST get request to the endpoint', async () => {
    const response = await axios.get(`${BASE_URL}/weather`, { params: { city: 'Moscow' } });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data) && response.data.length > 0).toBe(true);
});