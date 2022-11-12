const express = require('express');
const app = express();
const path = require('path');
const xml = require("xml");
const axios = require("axios");
const port = process.env.PORT || 3000;
const redis = require("redis");
const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://default:redispw@localhost:49153',
    password: process.env.REDIS_PASSWORD || ""
});
const expires = 24 * 60 * 60 * 7;
const defaultLevel = "4.0,4.1,4.2,5.0,5.1,5.2,6.0,6.1";

app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, 'public') });
});
app.get('/api/prices/resource/:item', async (req, res) => {
    let { level, location } = req.query || ""
    let itemsLevelList = level ? level.split(",") : defaultLevel.split(",")
    let itemPricesList = []
    if (await client.exists(req.originalUrl)) {
        itemPricesList = JSON.parse(await client.get(req.originalUrl))
    }
    else {
        let resolvedPromisesArray = []
        for (let itemlevel of itemsLevelList) {
            let enchantment = itemlevel.replace(/\d\./, "")
            let levelTag = itemlevel.replace(/\.\d/, "")
            let name = enchantment > 0 ? `T${levelTag}_${req.params.item}_LEVEL${enchantment}@${enchantment}` : `T${levelTag}_${req.params.item}`
            let url = `https://www.albion-online-data.com/api/v2/stats/Prices/${name}.json`
            console.log("獲取資源URL: " + url) //debug
            resolvedPromisesArray.push(axios.get(url, { params: { locations: location } }));
        }
        console.log("------------------------------獲取資源URL分隔線------------------------------") //debug
        try {
            let items = await Promise.all(resolvedPromisesArray);
            itemPricesList = items.map(res => {
                return { item: [{ name: res.data[0].item_id }, { price: res.data[0].sell_price_min }] };
            })
        } catch (error) {
            res.status(500).send(error);
        }
        let zeroPriceItem = itemPricesList.find(data => data.item[1].price === 0)
        if (typeof (zeroPriceItem) == "undefined") {
            client.set(req.originalUrl, JSON.stringify(itemPricesList));
            client.expire(req.originalUrl, expires)
        }
    }
    res.header("Content-Type", "application/xml");
    res.status(200).send(xml([{ marketResponse: itemPricesList }], true));
});

app.get('/api/prices/equip/:item', async (req, res) => {
    let { level, location } = req.query || ""
    let itemsLevelList = level ? level.split(",") : defaultLevel.split(",")
    let itemPricesList = []
    if (await client.exists(req.originalUrl)) {
        itemPricesList = JSON.parse(await client.get(req.originalUrl))
    }
    else {
        let resolvedPromisesArray = []
        for (let itemlevel of itemsLevelList) {
            let enchantment = itemlevel.replace(/\d\./, "")
            let levelTag = itemlevel.replace(/\.\d/, "")
            let name = enchantment > 0 ? `T${levelTag}_${req.params.item}@${enchantment}` : `T${levelTag}_${req.params.item}`
            let url = `https://www.albion-online-data.com/api/v2/stats/Prices/${name}.json`
            console.log("獲取裝備URL: " + url) //debug
            resolvedPromisesArray.push(axios.get(url, { params: { locations: location } }))
        }
        console.log("------------------------------獲取裝備URL分隔線------------------------------") //debug
        try {
            let items = await Promise.all(resolvedPromisesArray);
            itemPricesList = items.map(res => {
                let item = res.data.reduce((prev, curr) => {
                    if (prev.sell_price_min == 0) {
                        return curr
                    } else if (curr.sell_price_min == 0) {
                        return prev
                    } else {
                        return prev.sell_price_min < curr.sell_price_min ? prev : curr
                    }
                })
                return { item: [{ name: item.item_id }, { price: item.sell_price_min }] };
            })
        } catch (error) {
            res.status(500).send(error);
        }
        let zeroPriceItem = itemPricesList.find(data => data.item[1].price === 0)
        if (typeof (zeroPriceItem) == "undefined") {
            client.set(req.originalUrl, JSON.stringify(itemPricesList));
            client.expire(req.originalUrl, expires)
        }
    }
    res.header("Content-Type", "application/xml");
    res.status(200).send(xml([{ marketResponse: itemPricesList }], true));
});

app.get('/api/prices/artifact/:item', async (req, res) => {
    let { level, location } = req.query || ""
    let itemsLevelList = level ? level.split(",") : defaultLevel.split(",")
    let itemPricesList = []
    if (await client.exists(req.originalUrl)) {
        itemPricesList = JSON.parse(await client.get(req.originalUrl))
    }
    else {
        let resolvedPromisesArray = []
        for (let itemlevel of itemsLevelList) {
            let levelTag = itemlevel.replace(/\.\d/, "")
            let name = `T${levelTag}_${req.params.item}`
            let url = `https://www.albion-online-data.com/api/v2/stats/Prices/${name}.json`
            console.log("獲取神器URL: " + url) //debug
            resolvedPromisesArray.push(axios.get(url, { params: { locations: location } }))
        }
        console.log("------------------------------獲取神器URL分隔線------------------------------") //debug
        try {
            let items = await Promise.all(resolvedPromisesArray);
            itemPricesList = items.map(res => {
                return { item: [{ name: res.data[0].item_id }, { price: res.data[0].sell_price_min }] };
            })
        } catch (error) {
            res.status(500).send(error);
        }
        let zeroPriceItem = itemPricesList.find(data => data.item[1].price === 0)
        if (typeof (zeroPriceItem) == "undefined") {
            client.set(req.originalUrl, JSON.stringify(itemPricesList));
            client.expire(req.originalUrl, expires)
        }
    }
    res.header("Content-Type", "application/xml");
    res.status(200).send(xml([{ marketResponse: itemPricesList }], true));
});

app.listen(port, async () => {
    await client.connect()
    console.log(`Example app listening on port ${port}`)
});

module.exports = app;