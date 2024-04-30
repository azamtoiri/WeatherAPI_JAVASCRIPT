const axios = require('axios');
const BASE_URL = 'http://127.0.0.1:3000'; // Замените на адрес вашего сервера


// Тест для проверки доступности корневого пути
test('GET /', async () => {
    const response = await axios.get(BASE_URL);
    expect(response.status).toBe(200);
    expect(response.data).toStrictEqual({"message": "hello"});
});

// Тест для проверки доступности эндпоинта /weather
test('GET /weather', async () => {
    const response = await axios.get(`${BASE_URL}/weather`);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.length).toBeGreaterThan(0);
});
