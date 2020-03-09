document.addEventListener('DOMContentLoaded', function () {
    const caseList = document.querySelector('.js-corona-cases');
    const caseCount = document.querySelector('.js-cases-count');
    const deathCount = document.querySelector('.js-deaths-count');
    const buttons = document.querySelectorAll('.buttons button');

    const getJSON = function (url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = function () {
            var status = xhr.status;
            if (status === 200) {
                callback(null, xhr.response);
            } else {
                callback(status, xhr.response);
            }
        };
        xhr.send();
    };

    // TO DO: append random get parameter after url, timestamp for example

    getJSON('https://w3qa5ydb4l.execute-api.eu-west-1.amazonaws.com/prod/finnishCoronaData', function (err, data) {
        if (err !== null) {
            return false;
        }
        getCoronaData(data);
    });

    const formatDate = (date, isTimestamp) => {
        const caseDate = new Date(date);
        const formatDate = (date, pad) => {
            return date.toString().padStart(pad, '0');
        }
        const caseDateFormatted = `${formatDate(caseDate.getDate(), 2)}.${formatDate(caseDate.getMonth() + 1, 2)}.${caseDate.getFullYear()}`;
        return isTimestamp ? caseDate.getTime() : caseDateFormatted;
    }

    const checkInfectionSource = (infectionSource) => {
        if (/^[0-9]*$/.test(infectionSource)) {
            return `Patient ${infectionSource}`;
        }
        return infectionSource[0].toUpperCase() + infectionSource.slice(1);
    }

    const formatArea = (area) => {
        if (area === 'CHN') {
            return 'China';
        } else if (area === 'ITA') {
            return 'Italy';
        } else if (area === 'FIN') {
            return 'Finland';
        }
        return area;
    }

    const getCoronaData = (cases) => {
        let caseInfo = {};

        cases.confirmed.map(el => {
            if (/^[0-9]*$/.test(el.infectionSource)) {
                let infected = caseInfo[el.infectionSource] + 1;
                if (isNaN(infected)) {
                    infected = 1;
                }
                caseInfo[el.infectionSource] = infected;
            }
        });

        cases.confirmed.map(el => {
            const caseID = el.id;
            const caseName = `Patient ${caseID}`;
            const caseArea = el.healthCareDistrict;
            const infectionSourceCountry = formatArea(el.infectionSourceCountry);
            const infectionSource = checkInfectionSource(el.infectionSource);
            const caseDateFormatted = formatDate(el.date, false);
            const caseDate = formatDate(el.date, true);
            let hasInfected = '';
            let infectedTotal = 0;
            if (caseInfo[caseID]) {
                infectedTotal = caseInfo[caseID];
                hasInfected = `<li class="text-red"><b>Has infected: ${caseInfo[caseID]}</b> other patients</li>`;
            }

            caseList.innerHTML = caseList.innerHTML + (`<div class="case-item js-case-item" 
            data-id="${caseID.toString().padStart(2,'0')}" data-infected="${infectedTotal}" data-date="${caseDate}" data-area="${caseArea}" data-origin="${infectionSourceCountry}" data-source="${el.infectionSource.toString().padStart(2,'0')}">
            <div class="case-item-content">
                <h2 class="case-item-name">${caseName}</h2>
                <ul class="case-item-info">
                    <li><b>Infection date:</b> ${caseDateFormatted}</li>
                    <li><b>Infection area:</b> ${caseArea}</li>
                    <li><b>Infection origin:</b> ${infectionSourceCountry}</li>
                    <li><b>Infection source:</b> ${infectionSource}</li>
                    ${hasInfected}
                </ul>
            </div>
            </div>`);
        });

        caseCount.innerHTML = cases.confirmed.length;
        deathCount.innerHTML = cases.deaths.length;
    }

    function sort(attr) {
        return function(a, b) {
          return a.getAttribute(attr).localeCompare(b.getAttribute(attr));
        };
      }

    function sortCases() {
        const caseItems = document.querySelectorAll('.js-case-item');
        [].forEach.call(caseItems, function (el) {
            el.classList.add('hidden');

            window.setTimeout(function () {
                el.classList.remove('hidden');
            }, 100);
        });

        [].forEach.call(buttons, function (el) {
            el.classList.remove('active');
        });

        this.classList.add('active');

        if (this.classList.contains('js-sort-by-date')) {
            Array.prototype.slice.call(document.querySelectorAll('.js-case-item')).sort(function (a, b) {
                return a.getAttribute('data-date').localeCompare(b.getAttribute('data-date'));
            }).forEach(function (currValue) {
                currValue.parentNode.appendChild(currValue);
            });
        } else if (this.classList.contains('js-sort-by-area')) {
            Array.prototype.slice.call(document.querySelectorAll('.js-case-item')).sort(function (a, b) {
                return a.getAttribute('data-area').localeCompare(b.getAttribute('data-area'));
            }).forEach(function (currValue) {
                currValue.parentNode.appendChild(currValue);
            });
        } else if (this.classList.contains('js-sort-by-origin')) {
            Array.prototype.slice.call(document.querySelectorAll('.js-case-item')).sort(function (a, b) {
                return a.getAttribute('data-origin').localeCompare(b.getAttribute('data-origin'));
            }).forEach(function (currValue) {
                currValue.parentNode.appendChild(currValue);
            });
        } else if (this.classList.contains('js-sort-by-source')) {
            Array.prototype.slice.call(document.querySelectorAll('.js-case-item')).sort(function (a, b) {
                return a.getAttribute('data-source').localeCompare(b.getAttribute('data-source'));
            }).forEach(function (currValue) {
                currValue.parentNode.appendChild(currValue);
            });
        } else if (this.classList.contains('js-sort-by-infected')) {
            Array.prototype.slice.call(document.querySelectorAll('.js-case-item')).sort(function (a, b) {
                return b.getAttribute('data-infected').localeCompare(a.getAttribute('data-infected'));
            }).forEach(function (currValue) {
                currValue.parentNode.appendChild(currValue);
            });
        } else {
            Array.prototype.slice.call(document.querySelectorAll('.js-case-item')).sort(function (a, b) {
                return a.getAttribute('data-id').localeCompare(b.getAttribute('data-id'));
            }).forEach(function (currValue) {
                currValue.parentNode.appendChild(currValue);
            });
        }
    }

    document.querySelector(".js-sort-by-date").addEventListener("click", sortCases);
    document.querySelector(".js-sort-by-area").addEventListener("click", sortCases);
    document.querySelector(".js-sort-by-origin").addEventListener("click", sortCases);
    document.querySelector(".js-sort-by-source").addEventListener("click", sortCases);
    document.querySelector(".js-sort-by-infected").addEventListener("click", sortCases);
    document.querySelector(".js-sort-by-name").addEventListener("click", sortCases);

}, false);