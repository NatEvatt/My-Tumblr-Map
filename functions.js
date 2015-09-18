var eachEntryJson = [];
var pageNum = 1;
var myLayer;


var url = getUrl();
parseRSS(url, callback);

function parseRSS(url, callback) {
    $.ajax({
        url: document.location.protocol + '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&callback=?&q=' + encodeURIComponent(url),
        dataType: 'json',
        success: function (data) {
            pageNum += 1;
            callback(data.responseData.feed);
        }
    });
}

function callback(data) {

    if (data.entries.length > 0) {
        for (var i = 0; i < data.entries.length; i++) {
            eachEntryJson.push(data.entries[i]);
            if (i == data.entries.length - 1) {
                var url = getUrl();
                parseRSS(url, callback);
            }
        }
    } else {
        mapEntries(); //there are no posts left so start to map
    }
}

function mapEntries() {

    for (var i = 0; i < eachEntryJson.length; i++) {

        //get the mapcoordinates
        var description = eachEntryJson[i].content;
        var mapCoords = getMapCoordinates(eachEntryJson[i].categories);

        //If there are mapCoordinates in the post, map them
        if (typeof mapCoords !== 'undefined') {
            var title = eachEntryJson[i].title;
            var marker = L.marker(new L.LatLng(mapCoords[0], mapCoords[1]), {
                icon: L.icon({
                    'iconUrl': "images/tumblrLogo.png",
                    'iconSize': [50, 50], // size of the icon
                    'iconAnchor': [25, 25], // point of the icon which will correspond to marker's location
                    'popupAnchor': [0, -25], // point from which the popup should open relative to the iconAnchor
                    'className': "markerClass"
                }),
                title: title
            });
            //                    var title = eachEntryJson[i].title;
            //                    var snippet = eachEntryJson[i].contentSnippet;
            var content = getContentString(eachEntryJson[i].content);
            var link = eachEntryJson[i].link;
            var imgString = getImgString(eachEntryJson[i].content);
            var PopupString = content[0];
            PopupString += imgString[0];
            for (var k = 1; k < content.length; k++) {
                PopupString += content[k];
            }
            for (var j = 1; j < imgString.length; j++) {
                PopupString += imgString[j];
            }
            PopupString += "<a href='" + link + "' target='blank' ><button class='btn btn-default popup-btn'>Go to the full page</button></a>";

            // Create custom popup content
            var popupContent = PopupString;

            marker.bindPopup(popupContent, {
                closeButton: true,
                minWidth: 310
            });

            markerCluster.addLayer(marker);
        }
    }

    map.addLayer(markerCluster);
    map.fitBounds(markerCluster.getBounds());
}

function getMapCoordinates(array) {
    var mapCoordinates;
    for (var i = 0; i < array.length; i++) {
        if (array[i].indexOf("latlon") > -1) {
            mapCoordinates = array[i].split('latlon')[1].split('__');
        }
    }
    //            if (mapCoordinates[0] && mapCoordinates[1]) {
    return mapCoordinates;
    //            }
}

function getUrl() {
    if (pageNum == 1) {
        return "http://natandsaz.tumblr.com/rss";
    } else {
        return "http://natandsaz.tumblr.com/page/" + pageNum + "/rss";
    }
}

function getContentString(content) {
    var xml = '<item>' + content + '</content>';
    var textArray = $(xml).find('p').map(function () {
        return "<p>" + this.innerHTML + "</p>";
    }).get();
    return textArray;
}

function getImgString(content) {
    var xml = '<item>' + content + '</content>';

    //            var srcArray = $(xml).
    var srcArray = $(xml).find('img').map(function () {
        return "<a href='" + this.src + "' target='blank' ><img class='popUpImg' src='" + this.src + "' /></a>";
    }).get();

    return srcArray
}