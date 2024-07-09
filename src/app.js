// Features to be added
// - search by location name - display weather | == user can do anyone among them - done
// - current location - display weather    |
// - dropdown menu for recently search cities - use localstorage - initially no dropdown - done
// - clicking on any city in dropdown should update the weather - done
// - Valid user inputs - done
// - Functionality to implement extended weather for multiple days - 5 days - done
// - Handle API errors gracefully - done

// Global Variables
const locationInput = document.querySelector('main .location-input');
const locationSearchBtn = document.querySelector('main .location-search');
const trackLocationBtn = document.querySelector('main .track-location');
const noCityEnteredElement = document.querySelector('main .no-city-entered');
const mainWeatherSection = document.querySelector('.main-weather-section');
const mainWeatherImage = document.querySelector('.main-weather-section .location-weather-image');
const mainWeatherLocationName = document.querySelector('.main-weather-section .location-name');
const mainWeatherLocationTemp = document.querySelector('.main-weather-section .location-temp');
const mainWeatherLocationDateTime = document.querySelector('.main-weather-section .location-date-time');
const mainWeatherLocationWeatherType = document.querySelector('.main-weather-section .location-weather-description');
const weatherOtherDetailsContainer = document.querySelector('.other-weather-section');
const weatherOtherDetailsContainerHeading = document.querySelector('.other-weather-details-section-heading');
const extendedForecastHeading = document.querySelector('.extended-forecast-heading');
const extendedForecastContainer = document.querySelector('.extended-forecast-container');
const recentSearchDropdownContainer = document.querySelector('.recent-search-dropdown-container');
const recentSearchDropdown = document.querySelector('.recent-search-dropdown');

const recentSearchDropdownHeading = document.querySelector('.recent-search-heading');


const VISUAL_CROSSING_API_KEY = "8ZLS6YDNME24NJG9R37MG7RU2";
const VISUAL_CROSSING_BASE_URL = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";

const apiUrls = {
    byLocationName: (locationName) => `${VISUAL_CROSSING_BASE_URL}${locationName}/?unitGroup=metric&include=days&key=${VISUAL_CROSSING_API_KEY}&contentType=json`,
    byPositionalValues: (latitude, longitude) => `${VISUAL_CROSSING_BASE_URL}${latitude}%2${longitude}?unitGroup=metric&include=days&key=${VISUAL_CROSSING_API_KEY}&contentType=json`
}

const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

const weatherTypesImages = {
    sunny: "../resources/sunny.png",
    cloud: "../resources/cloudy.png",
    rain: "../resources/rainy.png",
    snow: "../resources/snow.png",
    clear: "../resources/clear.png",
    wind: "../resources/wind.png",
    fog: "../resources/fog.png"
};

// Function to update main weather elements data
function updateMainWeatherDetails(weatherData) {
    const { address: name } = weatherData;
    const { icon, temp, datetime: date, datetimeEpoch: timeInMilliseconds, description } = weatherData?.days[0];
    let iconImageURL = null;

    // Show Weather Related Elements 
    mainWeatherSection.style.display = "block";

    // Updating the Values of Elements
    Object.keys(weatherTypesImages).forEach(key => {
        if(icon.includes(key)) iconImageURL = weatherTypesImages[key];
    });
    
    mainWeatherImage.src = iconImageURL;
    mainWeatherLocationName.textContent = name.toUpperCase();
    mainWeatherLocationTemp.textContent = temp + " °C";
    mainWeatherLocationDateTime.textContent = date;
    mainWeatherLocationWeatherType.textContent = description;
}

// function which removes each child of the received container 
function removePreviousChildren(container) {
    Array.from(container.children).forEach(child => child.remove());
} 


// function to update other weather element details
function updateOtherWeatherDetails(weatherData) {
    removePreviousChildren(weatherOtherDetailsContainer);

    const { dew, humidity, precip, windspeed, uvindex, visibility } = weatherData?.days[0];
    const weatherProperties = {
        dew: dew,
        humidity: humidity,
        precip: precip,
        windspeed: windspeed,
        uvindex: uvindex,
        visibility: visibility
    }

    Object.keys(weatherProperties).forEach(property => { 
        // Creating elements
        const weatherPropertyArticle = document.createElement('article');
        const weatherPropertyHeading = document.createElement('h3');
        const weatherPropertyValue = document.createElement("p");

        // Adding Classes
        weatherPropertyArticle.className = "bg-white min-w-[200px] text-center w-fit p-3 rounded-xl shadow-lg";
        weatherPropertyHeading.className = "font-semibold text-lg";
        weatherPropertyValue.className = "mt-3 text-lg";

        // Adding the Values
        weatherPropertyHeading.textContent = property.toUpperCase();
        weatherPropertyValue.textContent = weatherProperties[property];

        if (property === "dew") weatherPropertyValue.textContent += " °C";
        else if (property === "precip") weatherPropertyValue.textContent += " mm";
        else if (property === "humidity") weatherPropertyValue.textContent += " %";
        else if (property === "windspeed") weatherPropertyValue.textContent += " mph";
        else if (property === "visibility") weatherPropertyValue.textContent += " km";

        // Appending elements to weatherPropertyArticle
        weatherPropertyArticle.append(weatherPropertyHeading, weatherPropertyValue);

        // Appending weatherPropertyArticle to the weatherOtherDetailsContainer
        weatherOtherDetailsContainer.appendChild(weatherPropertyArticle);
    });
}


// Funtion to return the day in word of the given dayNumber
function getDayInWords(dayNumber) {
    let dayInWords = "";

    switch (dayNumber) {
        case 0: {
            dayInWords =  "Sunday";
            break;
        }
        case 1: {
            dayInWords =  "Monday";
            break;
        }
        case 2: {
            dayInWords =  "Tuesday";
            break;
        }
        case 3: {
            dayInWords =  "Wednesday";
            break;
        }
        case 4: {
            dayInWords =  "Thrusday";
            break;
        }
        case 5: {
            dayInWords =  "Friday";
            break;
        }
        case 6: {
            dayInWords =  "Saturday";
            break;
        }
    }

    return dayInWords;
}

// Function to update the value of elements of extended forecast
function updatedExtendedWeatherDetails(weatherData) {
    removePreviousChildren(extendedForecastContainer);

    weatherData?.days?.slice(1, 6).forEach(day => { 
        const { datetime: date, icon, temp } = day;

        // Creating elements
        const extendedWeatherPropertyArticle = document.createElement('article');
        const extendedWeatherPropertyWeek = document.createElement('h3');
        const extendedWeatherPropertyImageURL = document.createElement('img');
        const extendedWeatherPropertyValue = document.createElement("p");

        // Adding Classes
        extendedWeatherPropertyArticle.className = "bg-white text-center w-fit p-3 rounded-xl shadow-lg";
        extendedWeatherPropertyImageURL.className = "w-36 my-5";

        // Adding the Values
        extendedWeatherPropertyWeek.textContent = getDayInWords(new Date(date).getDay());
        extendedWeatherPropertyValue.textContent = temp + " °C";
        Object.keys(weatherTypesImages).forEach(weatherType => {
            if (icon.includes(weatherType)) {
                extendedWeatherPropertyImageURL.src = weatherTypesImages[weatherType];
            }
        });

        // Appending elements to extendedWeatherPropertyArticle
        extendedWeatherPropertyArticle.append(extendedWeatherPropertyWeek, extendedWeatherPropertyImageURL, extendedWeatherPropertyValue);

        // Appending extendedWeatherPropertyArticle to the extendedForecastContainer
        extendedForecastContainer.appendChild(extendedWeatherPropertyArticle);
    });
}


// Function to add option element in recent search dropdown
function addLocationToRecentSearch(locationName, toAddForcefully) {
    if (!toAddForcefully && (recentSearches.length && recentSearches.includes(locationName.toLowerCase()))) return;

    // Option to remove if the children length goes 11 -> One default with 10 location names
    if (recentSearchDropdown.children.length === 10) {
        recentSearchDropdown.children[recentSearchDropdown.children.length - 1].remove();
    }

    // Adding location option to the recentSearchDropdown
    const option = document.createElement("p");
    option.className = "location-option cursor-pointer block py-2 px-2 hover:bg-slate-200";
    option.textContent = locationName.slice(0, 1).toUpperCase() + locationName.slice(1);
    if(!toAddForcefully) {
        recentSearchDropdown.insertBefore(option, recentSearchDropdown.children[0]);
        recentSearches.push(locationName.toLowerCase());
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    } else {
        recentSearchDropdown.appendChild(option);
    }
}

// Function to generate popup
function popupMessage(message, color) {
    const container = document.createElement('div');
    const p = document.createElement('p');
    
    p.textContent = message;
    container.className = `bg-white py-2 ps-2 pe-3 rounded-lg min-w-[200px] shadow-lg border-2 ${color === '#ff0000' ? 'border-red-600 text-red-600' : 'border-green-600 text-green-600'} absolute right-5 top-5`;
    p.className = "w-full";

    container.appendChild(p);
    document.body.appendChild(container);

    setTimeout(() => {
        container.remove();
    }, 3000);
}


// Function to validate the location name
function validateLocationName(locationName) {
    if (locationName === "") {
        popupMessage("Enter Location!", "#ff0000");
        return;
    }

    return true;
}


// Function to fetch weather data
async function fetchWeatherData(e, locationNamePassed) {
    const locationName = locationNamePassed ? locationNamePassed : locationInput.value;

    if (!validateLocationName(locationName.toLowerCase().trim())) return;

    try {
        const weatherResponse = await fetch(apiUrls.byLocationName(locationName));
        const weatherResponseJson = await weatherResponse.json();

        // Changing the styles of elements 
        noCityEnteredElement.style.display = "none";
        weatherOtherDetailsContainerHeading.style.display = "block";
        extendedForecastHeading.style.display = "block";

        updateMainWeatherDetails(weatherResponseJson);
        updateOtherWeatherDetails(weatherResponseJson);
        updatedExtendedWeatherDetails(weatherResponseJson);

        recentSearchDropdownContainer.style.display = "block";
        addLocationToRecentSearch(locationName, false);
    } catch (error) {
        if (error.toString().includes("not valid JSON")) popupMessage("Location does not Name!", "#ff0000");
        else popupMessage("Network Error", "#ff0000");
    }
}

// Function to fetch data based on location clicked in the dropdown
function fetchWeatherDataOnLocationClickedInDropdown(e) {
    const target = e.target;
    let locationName = null;

    if (target.classList.contains("location-option")) {
        locationName = e.target.textContent;
        fetchWeatherData(e, locationName);
    }
}

// Checking if recentSearches already have places searched before that show the weather of the least recently seen location and also show recent searches dropdown 
if (recentSearches.length) {
    recentSearches.toReversed().forEach((searchName, index) => { 
        if (index === 0) fetchWeatherData(null, searchName);
        addLocationToRecentSearch(searchName, true);
    });
}                                                                                                                                                                                                                                                                

locationSearchBtn.addEventListener('click', fetchWeatherData);
recentSearchDropdown.addEventListener('click', fetchWeatherDataOnLocationClickedInDropdown);