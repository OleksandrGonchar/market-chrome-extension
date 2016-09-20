chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.executeScript(tab.id, {
        code: "(" + calculate.toString() + ")();"
    });
});

///   document.getElementsByClassName("market_commodity_orders_header_promote")[1]
/// https://api.csgofast.com/price/all
//   https://steamcommunity.com/market/search?q=AK-47+%7C+Красная+линия

//https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&date=20160920&json


var calculate = function () {
    var extensionLink,
        searchLinkSteam = 'https://steamcommunity.com/market/search?q=';

    function coursRate(count, course) {
        return count / course;
    }

    var testFlag = true;

    function addPriceInUsdToDomEllement(elem, price, timeOut) {
        var name = elem.getElementsByClassName('name')[0].textContent;

        function domManipulation(name, price) {
            var promise,
              timeoutRatio = 15000;
            var linkForAll = '<a href="' + searchLinkSteam +
                    name +
                    '"  target="_blank" title="Price on market in USD ($)"><strong>$</strong>' +
                    price.toFixed(2) +
                    '</a>',
                linkForExpensive = '';

            if (testFlag && price.toFixed(2) > 0.05) {

                promise = new Promise(function (resolve, reject) {

                    console.log("Begin", timeOut * timeoutRatio);
                    setTimeout(function () {
                        getPriceFromStaemMarket(name)
                            .then(function (response) {
                                var cost = parseUnsverFromSteam(response, name);
                                var parsedSteamCost = +cost.price;
                                var steamCommission = parsedSteamCost *0.13;

                                linkForExpensive = '<a href="#" title="Calculate your money after sold this item on steam (without steam commission)">$' +
                                    parsedSteamCost.toFixed(2) +
                                    ' - $' +
                                    price.toFixed(2) +
                                    ' = ' +
                                    (parsedSteamCost - price - steamCommission).toFixed(2) +
                                    '</a>';

                                console.log(parsedSteamCost, price,steamCommission, parsedSteamCost - price - steamCommission);
                                elem.getElementsByClassName('link-for-expensive')[0].innerHTML = linkForExpensive;
                                return this;
                            }, function (error) {
                                return console.log("Rejected: " + error);
                            });
                        resolve();
                    }, timeOut * timeoutRatio);
                });
                promise.then(function (result) {
                    // первая функция-обработчик - запустится при вызове resolve
                    console.log("End", timeOut * timeoutRatio);
                    //alert("Fulfilled: " + result); // result - аргумент resolve
                }, function (error) {
                    // вторая функция - запустится при вызове reject
                    console.log("Rejected: " + error); // error - аргумент reject
                });

                //testFlag = false;
            }
            var div = document.createElement('div');
            div.className = "price-in-usd";
            div.innerHTML = '<div>' + linkForAll + '</div><div class="link-for-expensive"></div>';
            elem.getElementsByClassName('imageblock')[0].appendChild(div);
        }

        domManipulation(name, price);
    }

    function calculatePriceInUsd(course) {
        var item = document.getElementsByClassName('item'),
            price = 0,
            curentItem;

        for (var i = 0, length = item.length; i < length; i++) {
            curentItem = item[i];
            price = curentItem.getElementsByClassName('price')[0].textContent;
            price = coursRate(price, course);
            addPriceInUsdToDomEllement(curentItem, price, i);
        }

        item = document.getElementsByClassName('ip-price');
        //console.log(item);
        if (item.length) {
            price = item[0].getElementsByClassName('ip-bestprice')[0].textContent;
            var div = document.createElement('div');
            div.className = "main-page-price-in-usd";
            div.innerHTML = '<a href="' +
                'https://steamcommunity.com/market/search?q=' +
                '"></a><strong>$</strong>' +
                coursRate(price, course).toFixed(2) +
                '>';
            item[0].appendChild(div);
        }
    }

    function getPriceFromStaemMarket(name) {
        console.log("some one do request to steam");
        return new Promise(function (resolve, reject) {
            var url = searchLinkSteam + name;

            var xhr = new XMLHttpRequest();

            xhr.open('GET', url, true);
            xhr.send();

            xhr.onreadystatechange = function () {
                if (xhr.readyState != 4) return;

                if (xhr.status != 200) {
                    reject(this.status + ': ' + this.statusText);
                } else {
                    resolve(this.response, name);
                }
            };
        });
    }

    function parseUnsverFromSteam(responce, name) {
        var parsedResponce,
            partWitnPriceAndNames,
            allPricesFromSearchSteam = [],
            allNamesFromSearchSteam = [],
            ingormation = {};

        parsedResponce = responce.replace(/\s{2,}/g, '')
            .match(/<a class="market_listing_row_link.+<\/span><\/div><div style="clear: both"><\/div><\/div><\/a><\/div>/ig);

        partWitnPriceAndNames = /<a class="market_listing_row_link.+<\/span><\/div><div style="clear: both"><\/div><\/div><\/a><\/div>/ig.exec(parsedResponce);
        partWitnPriceAndNames = partWitnPriceAndNames[0].match(/<span class="normal_price">\$\d+\.\d+/g);

        for (var e = 0; e < partWitnPriceAndNames.length; e++) {
            allPricesFromSearchSteam[e] = partWitnPriceAndNames[e].replace(/<span class="normal_price">\$/ig, '');
        }

        allNamesFromSearchSteam = (/<a class="market_listing_row_link.+<\/span><\/div><div style="clear: both"><\/div><\/div><\/a><\/div>/ig
            .exec(responce
                .replace(/\s{2,}/g, '')))[0]
            .match(/_name" class="market_listing_item_name" style="color: \#\w{6};">[^<]+/g);
        for (var k = 0; k < allNamesFromSearchSteam.length; k++) {

            allNamesFromSearchSteam[k] = allNamesFromSearchSteam[k]
                .replace(/_name" class="market_listing_item_name" style="color: \#\w{6};">/ig, '');

            if (allNamesFromSearchSteam[k] == name.trim()) {
                ingormation.name = allNamesFromSearchSteam[k];
                ingormation.price = allPricesFromSearchSteam[k];
            }
        }
        if (!ingormation.price) {
            ingormation.price = allPricesFromSearchSteam[0];
        }

        ingormation.allNames = allNamesFromSearchSteam;
        ingormation.allPrices = allPricesFromSearchSteam;

        return ingormation;
    }

    function getCourse() {
        var xhr = new XMLHttpRequest();
        //long url for take Course rate from yahoo
        var url = "https://query.yahooapis.com/v1/public/yql?q=select+*+from+yahoo.finance.xchange+where+pair+=+%22USDRUB%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";
        xhr.open('GET', url, true);
        xhr.send();

        xhr.onreadystatechange = function () {
            var course;
            if (xhr.readyState != 4) return;

            if (xhr.status != 200) {
                alert('Can not take course rate! \n' + xhr.status + ': ' + xhr.statusText);
            } else {
                course = JSON.parse(xhr.responseText).query.results.rate.Ask;
                calculatePriceInUsd(course);
            }
        };
    }

    (document.getElementById("extension") == null) ?
        (
            extensionLink = document.createElement("link"),
                extensionLink.href = chrome.extension.getURL("/styles/commentblocker_on.css"),
                extensionLink.id = "extension",
                extensionLink.type = "text/css",
                extensionLink.rel = "stylesheet",
                document.getElementsByTagName("head")[0].appendChild(extensionLink)
        )
        : (document.getElementsByTagName("head")[0].removeChild(document.getElementById("extension")));
    getCourse();
};
