const rawData = require("./population_json.json")
const fs = require("fs")
const path = require("path")

const latestEntries = rawData.reduce((current, next) => {
	const country = next['Country Name']
	const existingEntry = current[country]
	if (existingEntry && existingEntry.Year >= next.Year) { return current }
	current[country] = next
	return current
}, {})

fs.writeFile(path.join(__dirname, "processed-populations.js"), "const data = " +JSON.stringify(latestEntries, null, 2) + "\nexport default data", (err, res) => console.log({err, res}))

