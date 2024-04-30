const express = require('express');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3000;

const YR_API_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=55.7522&lon=37.6156';

const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 YaBrowser/24.4.0.0 Safari/537.36"
}


async function fetchAndSendWeatherData() {
    try{
        const response = await axios.get(YR_API_URL, { headres });
        const data = response.data
        // здесь можно обработать данные и отправить куда то 
        console.log('Wheather data fetched successfully: ', data);
    } catch (error) {
        console.error("Error fetching weather data: ",error.message);
    }
}

// Запускать фукнцию fetchAndSendWeatherData() каждый день в 14:00
cron.schedule('0 14 * * *', () => {
    console.log("Running fetchAndSendWeatherData() ...");
    fetchAndSendWeatherData();
});

app.get('/', async (req, res) => {
    try {
        res.json({"message": "hello"});
        res.status(200);
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

app.get('/weather', async (req, res) => {
    try {
        const response = await axios.get(YR_API_URL, { headers });
        const data = response.data; 
        const forecast = data.properties.timeseries.map(entry => ({
            time: entry.time,
            temperature: entry.data.instant.details.air_temperature
        }));
        res.json(forecast);
        res.status(200);
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
