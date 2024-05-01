const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const rateLimit = require('express-rate-limit');
const path = require('path');
const bodyParser = require('body-parser');


const app = express();
const PORT = process.env.PORT || 3000;

const YR_API_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const DEFAULT_CITY = 'Moscow';

const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 YaBrowser/24.4.0.0 Safari/537.36"
}


async function fetchAndSendWeatherData() {
    try{
        const response = await axios.get(YR_API_URL, { headers });
        const data = response.data
        // здесь можно обработать данные и отправить куда то 
        console.log('Wheather data fetched successfully: ', data);
    } catch (error) {
        console.error("Error fetching weather data: ",error.message);
    }
}

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100 // ограничение на 100 запросов с одного IP
});

app.use(express.json());
app.use(limiter);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Запускать фукнцию fetchAndSendWeatherData() каждый день в 14:00
cron.schedule('0 14 * * *', () => {
    console.log("Running fetchAndSendWeatherData() ...");
    fetchAndSendWeatherData();
});

app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, "public", "html", "index.html");
    res.sendFile(indexPath);
});

app.get('/weather', async (req, res) => {
    try {
        let { city } = req.query;
        if (!city) {
            // Если название города не предоставлено, используем город по умолчанию
            city = DEFAULT_CITY;
        }

        // Получаем географические координаты города
        const locationResponse = await axios.get(NOMINATIM_URL, {
            params: {
                q: city,
                format: 'json',
                limit: 1
            }
        });

        // Извлекаем координаты из ответа
        const { lat, lon } = locationResponse.data[0];

        // Получаем прогноз погоды по координатам
        const weatherResponse = await axios.get(`${YR_API_URL}?lat=${lat}&lon=${lon}`, { headers });
        const forecast = weatherResponse.data.properties.timeseries.map(entry => ({
            time: entry.time,
            temperature: entry.data.instant.details.air_temperature
        }));
        res.json(forecast);
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

app.post('/weather', async (req, res) => {
    try {
        const cityName = req.body.city;
        // Получение координат города по его названию
        const locationResponse = await axios.get(NOMINATIM_URL, {
            params: {
                q: cityName,
                format: 'json',
                limit: 1
            }
        });
        const { lat, lon } = locationResponse.data[0];

        // Получение погоды по координатам города
        const weatherResponse = await axios.get(`${YR_API_URL}?lat=${lat}&lon=${lon}`, { headers } );
        const forecast = weatherResponse.data.properties.timeseries.map(entry => ({
            time: entry.time,
            temperature: entry.data.instant.details.air_temperature
        }));
        res.json(forecast);
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
