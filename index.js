const express = require('express')
const xml = require("xml");
const axios = require("axios")
const NodeCache = require("node-cache");
const app = express()
const port = process.env.PORT || 3000
const redis = require("redis");
const client = redis.createClient({ url: 'redis://34.138.215.241:6379' });

app.get('/api/prices/resource/:item', async (req, res) => {
    let { level, location } = req.query || ""
    if (typeof level === "undefined") {
        var itemsLevelList = "4.0,4.1,4.2,4.3,5.0,5.1,5.2,5.3,6.0,6.1,6.2,6.3,7.0,7.1,7.2,7.3,8.0,8.1,8.2,8.3".split(",")
    }
    else {
        var itemsLevelList = level.split(",")
    }
    let itemPricesList = []
    let itemList = []
    if (await client.exists(req.originalUrl)) {
        itemPricesList = JSON.parse(await client.get(req.originalUrl))
    }
    else {
        for (let itemlevel of itemsLevelList) {
            let enchantment = itemlevel.replace(/\d\./, "")
            let levelTag = itemlevel.replace(/\.\d/, "")
            let url, name
            let item = []
            if (enchantment > 0) {
                name = `T${levelTag}_${req.params.item}_LEVEL${enchantment}@${enchantment}`
                url = `https://www.albion-online-data.com/api/v2/stats/Prices/${name}.json`
            }
            else {
                name = `T${levelTag}_${req.params.item}`
                url = `https://www.albion-online-data.com/api/v2/stats/Prices/${name}.json`
            }
            console.log(url)
            try {
                var items = await axios.get(
                    url,
                    {
                        params: {
                            locations: location
                        }
                    })
            }
            catch (err) {
                console.log(err.message)
            }
            let nonZeroPriceItems = items.data.filter(item => item.sell_price_min > 0)
            if (!nonZeroPriceItems.length) {
                let MinPriceItem = items.data.reduce((prev, current) => {
                    return (prev.buy_price_max > current.buy_price_max) ? prev : current
                })
                item.push({ name: `T${levelTag}_${enchantment}_${req.params.item}` })
                item.push({ price: MinPriceItem.buy_price_max })
            }
            else {
                let MinPriceItem = nonZeroPriceItems.reduce((prev, current) => {
                    return (prev.sell_price_min < current.sell_price_min) ? prev : current
                })
                item.push({ name: `T${levelTag}_${enchantment}_${req.params.item}` })
                item.push({ price: MinPriceItem.sell_price_min })
            }
            itemList.push(item)
        }
        for (let item of itemList) {
            itemPricesList.push({ item: item })
        }
        client.set(req.originalUrl, JSON.stringify(itemPricesList));
        client.expire(req.originalUrl, 24 * 60 * 60)
    }
    res.header("Content-Type", "application/xml");
    res.status(200).send(xml([{ marketResponse: itemPricesList }], true));
})

app.get('/api/prices/equip/:item', async (req, res) => {
    let { level, location } = req.query || ""
    if (typeof level === "undefined") {
        var itemsLevelList = "4.0,4.1,4.2,4.3,5.0,5.1,5.2,5.3,6.0,6.1,6.2,6.3,7.0,7.1,7.2,7.3,8.0,8.1,8.2,8.3".split(",")
    }
    else {
        var itemsLevelList = level.split(",")
    }
    let itemPricesList = []
    let itemList = []
    if (await client.exists(req.originalUrl)) {
        itemPricesList = JSON.parse(await client.get(req.originalUrl))
    }
    else {
        for (let itemlevel of itemsLevelList) {
            let enchantment = itemlevel.replace(/\d\./, "")
            let levelTag = itemlevel.replace(/\.\d/, "")
            let url, name
            let item = []
            if (enchantment > 0) {
                name = `T${levelTag}_${req.params.item}@${enchantment}`
                url = `https://www.albion-online-data.com/api/v2/stats/Prices/${name}.json`
            }
            else {
                name = `T${levelTag}_${req.params.item}`
                url = `https://www.albion-online-data.com/api/v2/stats/Prices/${name}.json`
            }
            console.log(url)
            let items = await axios.get(
                url,
                {
                    params: {
                        locations: location
                    }
                })
            let nonZeroPriceItems = items.data.filter(item => item.sell_price_min > 0)
            if (!nonZeroPriceItems.length) {
                let MinPriceItem = items.data.reduce((prev, current) => {
                    return (prev.buy_price_max > current.buy_price_max) ? prev : current
                })
                item.push({ name: `T${levelTag}_${enchantment}_${req.params.item}` })
                item.push({ price: MinPriceItem.buy_price_max })
            }
            else {
                let MinPriceItem = nonZeroPriceItems.reduce((prev, current) => {
                    return (prev.sell_price_min < current.sell_price_min) ? prev : current
                })
                item.push({ name: `T${levelTag}_${enchantment}_${req.params.item}` })
                item.push({ price: MinPriceItem.sell_price_min })
            }
            itemList.push(item)
        }
        for (let item of itemList) {
            itemPricesList.push({ item: item })
        }
        client.set(req.originalUrl, JSON.stringify(itemPricesList));
        client.expire(req.originalUrl, 24 * 60 * 60)
    }
    res.header("Content-Type", "application/xml");
    res.status(200).send(xml([{ marketResponse: itemPricesList }], true));
})

app.get('/api/prices/artifact/:item', async (req, res) => {
    let { level, location } = req.query || ""
    if (typeof level === "undefined") {
        var itemsLevelList = "4,5,6,7,8".split(",")
    }
    else {
        var itemsLevelList = level.split(",")
    }
    let itemPricesList = []
    let itemList = []
    if (await client.exists(req.originalUrl)) {
        itemPricesList = JSON.parse(await client.get(req.originalUrl))
    }
    else {
        for (let itemlevel of itemsLevelList) {
            let levelTag = itemlevel
            let name = `T${levelTag}_${req.params.item}`
            let url = `https://www.albion-online-data.com/api/v2/stats/Prices/${name}.json`
            let item = []
            console.log(url)
            let items = await axios.get(
                url,
                {
                    params: {
                        locations: location
                    }
                })
            item.push({ name: `T${levelTag}_${req.params.item}` })
            item.push({ price: items.data[0].buy_price_max })
            itemList.push(item)
        }
        for (let item of itemList) {
            itemPricesList.push({ item: item })
        }
        client.set(req.originalUrl, JSON.stringify(itemPricesList));
        client.expire(req.originalUrl, 24 * 60 * 60)
    }
    res.header("Content-Type", "application/xml");
    res.status(200).send(xml([{ marketResponse: itemPricesList }], true));
})

app.listen(port, async () => {
    await client.connect()
    console.log(`Example app listening on port ${port}`)
})