const express = require('express')
const xml = require("xml");
const axios = require("axios")
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 86400 });
const app = express()
const port = 3000

app.get('/api/prices/:item', async (req, res) => {
    let itemsLevel = req.query.level.split(",") || "4.0,4.1,4.2,4.3,5.0,5.1,5.2,5.3,6.0,6.1,6.2,6.3,7.0,7.1,7.2,7.3,8.0,8.1,8.2,8.3"
    let location = req.query.location || "BlackMarket,Bridgewatch,Caerleon,FortSterling,Lymhurst,Martlock,Thetford"
    let pricesList = []
    if (cache.has(req.originalUrl)) {
        pricesList = cache.get(req.originalUrl)
    }
    else {
        for (let level of itemsLevel) {
            let enchantment = level.replace(/\d\./, "")
            let levelTag = level.replace(/\.\d/, "")
            let url, name
            if (enchantment > 0) {
                name = `T${levelTag}_${req.params.item}@${enchantment}`
                url = `https://www.albion-online-data.com/api/v2/stats/Prices/${name}.json`
            }
            else {
                name = `T${levelTag}_${req.params.item}`
                url = `https://www.albion-online-data.com/api/v2/stats/Prices/${name}.json`
            }
            let items = await axios.get(
                url,
                {
                    params: {
                        locations: location
                    }
                })
            let nonZeroPriceItems = items.data.filter(item => item.sell_price_min > 0)
            let MinPriceItem = nonZeroPriceItems.reduce((prev, current) => {
                return (prev.sell_price_min < current.sell_price_min) ? prev : current
            })
            pricesList.push({ [`T${levelTag}_${enchantment}_${req.params.item}`]: MinPriceItem.sell_price_min })
        }
    }
    res.header("Content-Type", "application/xml");
    cache.set(req.originalUrl, pricesList);
    res.status(200).send(xml([{ itemPrices: pricesList }], true));
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})