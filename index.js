import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import 'dotenv/config';

const app = express();
const port = 3000;
const API_ID = process.env.API_ID;


app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/",(req,res) => {
    res.render("index");
})

app.post("/weather",async(req,res) => {

  const city = req.body.city;
  const geoURL = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_ID}`;

  try {
    //Get the longitude and latitude
    const geoResponse = await axios.get(geoURL);
    const location = geoResponse.data[0];

    if (!location) {
      return res.send("City not found...🥲 Try again!");
    }

    const lat = location.lat;
    const lon = location.lon;

    // Get forecast data
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_ID}`;
    const weatherResponse = await axios.get(forecastURL);
    const forecastList = weatherResponse.data.list;

    //Get tomorrows forecast
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    const targetTime = `${yyyy}-${mm}-${dd} 12:00:00`;

    const forecast = forecastList.find(item => item.dt_txt === targetTime);

    if (!forecast) {
      return res.send("No forecast available for tomorrow at 12 PM 🌦️.");
    }

    
    const temp = forecast.main.temp;
    const description = forecast.weather[0].description;
    const icon = forecast.weather[0].icon;
    const pop = forecast.pop; 

    const rainMessage = pop >= 0.3 ? "Yes, it might rain tomorrow ☔" : "No rain expected tomorrow 🌞";

    
    res.render("result", {
      temp: temp,
      description: description,
      icon: icon,
      rainMessage: rainMessage,
      city: city
    });

  } catch (error) {
    console.error("ERROR:", error.message);
    res.send("Something went wrong 😞");
  }


});


app.listen(port,() => {
    console.log("Server running on port: "+port);
})

