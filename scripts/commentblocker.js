chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(tab.id, {
        code: "(" + calculate.toString() + ")();"
    });
    //var newURL = "http://stackoverflow.com/";
    //chrome.tabs.create({ url: newURL });
});

///   document.getElementsByClassName("market_commodity_orders_header_promote")[1]

/// https://api.csgofast.com/price/all

//               render?start=0&count=10&currency=3&language=english&format=json

//   https://steamcommunity.com/market/search?q=AK-47+%7C+Красная+линия


var calculate = function() {
    var xhr = new XMLHttpRequest();
    //long url for take Course rate
    var url = "https://steamcommunity.com/market/search?q=AK-47+%7C+Красная+линия";
    xhr.open('GET', url, true);
    xhr.send();

    xhr.onreadystatechange = function () { // (3)
        var course;
        if (xhr.readyState != 4) return;

        if (xhr.status != 200) {
            alert(xhr.status + ': ' + xhr.statusText);
        } else {
            console.log(xhr.responseText);
        }

    };
    var extensionLink;
    function coursRate(count, course){
        return count / course;
    }
    function addPriceInUsdToDomEllement(elem, price){
        var div = document.createElement('div');
        div.className = "price-in-usd";
        div.innerHTML = "<strong>$</strong>" + price.toFixed(2);

        elem.getElementsByClassName('imageblock')[0].appendChild(div);
    }
    function calculatePriceInUsd(course) {
        var item = document.getElementsByClassName('item'),
            price = 0,
            curentItem;

        for (var i = 0, length = item.length ; i<length; i++){
            curentItem = item[i];
            price = curentItem.getElementsByClassName('price')[0].textContent;
            price = coursRate(price, course);
            console.log(price, curentItem.getElementsByClassName('price')[0].textContent);
            addPriceInUsdToDomEllement(curentItem, price);
        }

        item = document.getElementsByClassName('ip-price');
        console.log(item);
        if(item.length) {
            price = item[0].getElementsByClassName('ip-bestprice')[0].textContent;
            var div = document.createElement('div');
            div.className = "main-page-price-in-usd";
            div.innerHTML = "<strong>$</strong>" + coursRate(price, course).toFixed(2);
            item[0].appendChild(div);
        }
    }
    function getCourse() {
        var xhr = new XMLHttpRequest();
        //long url for take Course rate
        var url = "https://query.yahooapis.com/v1/public/yql?q=select+*+from+yahoo.finance.xchange+where+pair+=+%22USDRUB%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";
        xhr.open('GET', url, true);
        xhr.send();

        xhr.onreadystatechange = function () { // (3)
            var course;
            if (xhr.readyState != 4) return;

            if (xhr.status != 200) {
                alert(xhr.status + ': ' + xhr.statusText);
            } else {
                //alert(xhr.responseText);
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

    frame();
    console.log(11);
};