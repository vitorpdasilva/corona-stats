The data file `population.json.json` was originally downloaded from <https://datahub.io/core/population#data> that links to <https://pkgstore.datahub.io/core/population/population_json/data/315178266aa86b71057e993f98faf886/population_json.json>

I've processed it with `process-population-json.js` that reduces the data to the data for the latest year for each country and saves that to `processed-populations.js` which exports it to be used in the code.

It is JS file becuase ES6 module imports don't work with JSON.