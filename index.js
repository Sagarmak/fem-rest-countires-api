// list of all the countries
let countries;

// all countries url
const defaultURL = "https://restcountries.eu/rest/v2/all";

let searchByCountry = "";
let regionalCountries = "all";

let body = document.querySelector("body");
let mainSection = document.querySelector(".main");
let headerSection = document.querySelector(".header");
let secondPage = document.querySelector(".second-page");
let secondPageContent = document.querySelector(".second-page .content");

// 1st, initialize the object
let xhr = new XMLHttpRequest();

function xhrOpenConnection(url) {
  // 2nd, fill in the details in the object
  // OPEN - type, url, async
  xhr.open("GET", url, true);
}

function xhrOnProgressConnection() {
  // 3rd, if api loading
  xhr.onprogress = function () {
    let noResultOutput = "";
    noResultOutput = `<div class="loading">
          <i class="fas fa-circle-notch fa-spin"></i>
        </div>`;
    mainSection.innerHTML = noResultOutput;
  };
}

function xhrOnLoadConnection() {
  // 4th, what should happen when data loads
  xhr.onload = function () {
    if (this.status == 200) {
      countries = JSON.parse(this.responseText);

      let countriesCards = "";
      countries.forEach((country, i) => {
        countriesCards += `
        <div class="card card-white" onclick="renderSecondPage('${country.alpha3Code}')">
          <img data-img="${country.flag}" id="image_${i}" alt="${country.name}_flag" 
            src="./placeholder-image/placeholder-365x215.gif" />
          <div class="card-details">
            <div class="title fs-1_2 bold pb-1">${country.name}</div>
              <div>
                <div class="pb-0_4">
                  <span class="bold">Population:</span>
                  <span>${country.population}</span>
                </div>
                <div class="pb-0_4">
                  <span class="bold">Region:</span>
                  <span>${country.region}</span>
                </div>
                <div class="pb-0_4">
                  <span class="bold">Capital:</span>
                  <span>${country.capital}</span>
                </div>
            </div>
          </div>
        </div>
        `;
      });
      mainSection.innerHTML = countriesCards;

      lazyLoadImages();
    } else if (xhr.status == 404) {
      // data not found
      let noResultOutput = "";
      noResultOutput = `
          <div class="no-result">
            Sorry, no result found!
          </div>
          `;
      mainSection.innerHTML = noResultOutput;
    }
  };
}

function xhrOnErrorConnection() {
  // 5th, if error while api fetching
  xhr.onerror = function () {
    let errorOutput = "";
    errorOutput = `
        <div class="error">
          There might be some issue fetching data.
        </div>
        `;
    mainSection.innerHTML = errorOutput;
  };
}

function xhrSendConnection() {
  xhr.send();
}

function fetchAllCountries() {
  headerSection.classList.remove('d-none');
  mainSection.classList.remove('d-none');
  
  xhrOpenConnection(getUrl());
  xhrOnProgressConnection();
  xhrOnLoadConnection();
  xhrOnErrorConnection();
  xhrSendConnection();
}

function fetchSearchedCountries(event) {
  searchByCountry = event.target.value;
  xhrOpenConnection(getUrl());
  xhrOnProgressConnection();
  xhrOnLoadConnection();
  xhrOnErrorConnection();
  xhrSendConnection();
}

function fetchRegionalCountries() {
  regionalCountries = event.target.value;
  xhrOpenConnection(getUrl());
  xhrOnProgressConnection();
  xhrOnLoadConnection();
  xhrOnErrorConnection();
  xhrSendConnection();
}

function getUrl() {
  if (searchByCountry) {
    if (!searchByCountry.length) {
      return defaultURL;
    } else {
      return getSearchedCountriesURL(searchByCountry);
    }
  } else if (regionalCountries) {
    if (regionalCountries == "all") {
      return defaultURL;
    } else {
      return getRegionalCountriesURL(regionalCountries);
    }
  } else {
    return defaultURL;
  }
}

function getSearchedCountriesURL(searchedCountry) {
  return `https://restcountries.eu/rest/v2/name/${searchedCountry}`;
}

function getRegionalCountriesURL(regionalCountry) {
  return `https://restcountries.eu/rest/v2/region/${regionalCountry}`;
}

function lazyLoadImages() {
  // all the image elements
  const images = document.querySelectorAll(".container .main .card img");
  
  // options to pass to IntersectionObserver
  // it tells, the viewport(root) to check 
  // if the viewport has reached 0.15(15%) of the image
  // then load the image itself
  const options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.15,
  };

  /* 
  * what happens when the 15% of the image has been detected
  * it will fire the callback funtion
  * to take the images from data-img and set to image's src - preloadimage funciton
  * and then to unobserve the image element
  */
  const callback = (entries, imageOvserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      } else {
        preloadImage(entry.target);
        imageOvserver.unobserve(entry.target);
      }
    });
  };

  let preloadImage = (entryTargetImage) => {
    const src = entryTargetImage.getAttribute("data-img");
    if (!src) {
      return;
    }
    entryTargetImage.src = src;
  };

  const imageObserver = new IntersectionObserver(callback, options);

  // loop the image elements to observe
  images.forEach((image) => imageObserver.observe(image));
}


// Second Page
function renderSecondPage(countryCode) {
  const countryUrl = `https://restcountries.eu/rest/v2/alpha/${countryCode}`;
  let countryDetails = {};
  let content = '';

  xhrOpenConnection(countryUrl);
  xhr.onprogress = function () {
    // 
  }
  xhr.onload = function() {
    countryDetails = JSON.parse(this.responseText);

    // add/remove certain sections of the page
    body.classList.add('white-bg');
    headerSection.classList.add('d-none');
    mainSection.classList.add('d-none');
    secondPage.classList.remove('d-none');

    const currencies = countryDetails.currencies.reduce((acc, currency, index, currencies) => {
      acc += currency.name;
      acc += (currencies.length != index+1) ? ', ' : '';
      return acc;
    }, '');
    const languages = countryDetails.languages.reduce((acc, language, index, languages) => {
      acc += language.name;
      acc += (languages.length != index+1) ? ', ' : '';
      return acc;
    }, '');
    let borders = (!countryDetails.borders.length) ? 
      `<span class="border-country pl-0_5">No borders</span>` : 
      countryDetails.borders.reduce((acc, border, index, borders) => {
        acc += `<span class="border-country small-card">${border}</span>`;
        return acc;
      }, '');

    // render the page here
    content = `
    <div class="content flex">
      <div class="flag">
        <img src="${countryDetails.flag}" alt="Image">
      </div>
      <div class="content-area">
        <div class="title bold fs-2 pb-1">${countryDetails.name}</div>
        <div class="description">
          <div class="info">
            <span class="subtitle bold">Native Name:</span>
            <span class="value">${countryDetails.nativeName}</span>
          </div>
          <div class="info">
            <span class="subtitle bold">Population:</span>
            <span class="value">${countryDetails.population}</span>
          </div>
          <div class="info">
            <span class="subtitle bold">Region:</span>
            <span class="value">${countryDetails.region}</span>
          </div>
          <div class="info">
            <span class="subtitle bold">Sub Region:</span>
            <span class="value">${countryDetails.subregion}</span>
          </div>
          <div class="info">
            <span class="subtitle bold">Capital:</span>
            <span class="value">${countryDetails.capital}</span>
          </div>
          <div class="info">
            <span class="subtitle bold">Top Level Domain:</span>
            <span class="value">${countryDetails.topLevelDomain}</span>
          </div>
          <div class="info">
            <span class="subtitle bold">Currencies:</span>
            <span class="value">${currencies}</span>
          </div>
          <div class="info">
            <span class="subtitle bold">Languages:</span>
            <span class="value">${languages}</span>
          </div>
        </div>
        <div class="borders">
          <div class="bold">Border Countries:</div>
          ${borders}
        </div>
      </div>
    </div>
    `;
    secondPageContent.innerHTML = content;
  };
  xhrSendConnection();
}

function backButtonAction() {
  body.classList.remove('white-bg');
  headerSection.classList.remove('d-none');
  mainSection.classList.remove('d-none');
  secondPage.classList.add('d-none');
}

function toggleDarkMode() {
  let checkbox = document.querySelector('.navbar .nav-subtitle input[type=checkbox]');
  checkbox.checked = !checkbox.checked;
  
  let body = document.body;
  let navbar = document.querySelector('body .navbar');
  let lightCards = document.querySelectorAll('.card.card-white');
  let darkCards = document.querySelectorAll('.card.card-dark');
  let icon = document.querySelector('.nav-subtitle i');
  let inputText = document.querySelector('.container .header .input-text input[type=text]');
  let select = document.querySelector('select');
  let secondPageWithDisplayNone = document.querySelector('.container .second-page.d-none');
  let whiteBackButton = document.querySelector('.container .second-page .header-button button.white-bg');
  let darkBackButton = document.querySelector('.container .second-page .header-button button.input-dark');

  // body and color
  body.classList.toggle('dark-bg');
  body.classList.toggle('white-font');

  // navbar
  navbar.classList.toggle('navbar-dark');

  // input
  inputText.classList.toggle('input-dark');
  select.classList.toggle('input-dark');
  
  // change color inside input
  select.classList.toggle('white-font');

  if (checkbox.checked) {
    // light cards to dark
    lightCards.forEach((card) => {
      card.classList.remove('card-white');
      card.classList.add('card-dark');
    });

    // icon change
    icon.classList.remove('far');
    icon.classList.add('fas');

    // back button
    whiteBackButton.classList.remove('white-bg');
    whiteBackButton.classList.remove('dark-font');
    whiteBackButton.classList.add('input-dark');
    whiteBackButton.classList.add('white-font');

    // input.classList.add('input-dark');
  } else {
    // dark cards to light
    darkCards.forEach((card) => {
      card.classList.remove('card-dark');
      card.classList.add('card-white');
    });

    // icon change
    icon.classList.remove('fas');
    icon.classList.add('far');

    // back button
    darkBackButton.classList.remove('input-dark');
    darkBackButton.classList.remove('white-font');
    darkBackButton.classList.add('white-bg');
    darkBackButton.classList.add('dark-font');

    // input.classList.remove('input-dark');
  }
}