//GeoLocation functions with Google map API
function updateMap(loc, drop) {
    var bounds = new google.maps.LatLngBounds();
    // Create a map object and specify the DOM element for display.
    var map = new google.maps.Map(document.getElementById('map'), {
        scrollwheel: false
    });
    var marker1 = new google.maps.Marker({
        position: { lat: loc.lat, lng: loc.long },
        map: map
    });
    var marker2 = new google.maps.Marker({
        position: { lat: drop.lat, lng: drop.long },
        map: map
    });
    bounds.extend(new google.maps.LatLng(loc.lat, loc.long));
    bounds.extend(new google.maps.LatLng(drop.lat, drop.long));
    map.fitBounds(bounds);
}

function geoMain(text){
  var dropLoc ={lat: 0, long: 0};
  document.getElementById("dropLoc").innerText = "Drop Location: "+text;
  dropLoc.lat = parseFloat(text.split(",")[0]);
  dropLoc.long = parseFloat(text.split(",")[1]);
  var clientLoc;
  function done(location){
    console.log("geoMain: done: "+location.lat+", "+location.long);
    clientLoc = location;
    document.getElementById("clientLoc").innerText = "Your Location: "+clientLoc.lat+", "+clientLoc.long + ", Toronto, ON, CANADA";
    updateMap(clientLoc, dropLoc);
    var myWorker = new Worker('js/distanceWorker.js');
    myWorker.onmessage = function(event){
      console.log("Worker said: "+event.data);
      document.getElementById("distance").innerText = "Distance: "+event.data+"km";
    };
    var message = {p1: clientLoc, p2: dropLoc};
    myWorker.postMessage(message);
  }
  getGeoLocation(done);
}

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 },
        scrollwheel: false,
        zoom: 2
    });
}
defaultLoc = { lat: 43.6532, long: -79.3832 };
function getGeoLocation(callback){
  if(!navigator.geolocation){
    console.log("getGeoLocation: navfail")
    callback(defaultLoc);
  }

  function success(position){
    console.log("getGeoLocation: success")
    var location = {lat: position.coords.latitude, long: position.coords.longitude};
    callback(location);
  }

  function error(){
    console.log("getGeoLocation: error");
    callback(defaultLoc);
  }
  navigator.geolocation.getCurrentPosition(success, error);
}

//WebWorker to Calculate distance in KMs
onmessage = function (event) {
    console.log(event.data.p1);
    console.log(event.data.p2);
    calcDistance(event.data.p1, event.data.p2);
};

if (typeof (Number.prototype.toRad) == "undefined") {
    Number.prototype.toRad = function () {
        return this * Math.PI / 180;
    }
}

function calcDistance(p1, p2) {
    var R = 6371; //meters
    var lat1 = p1.lat.toRad();
    var lat2 = p2.lat.toRad();
    var dlat = (p2.lat - p1.lat).toRad();
    var dlong = (p2.long - p1.long).toRad();

    var a = Math.sin(dlat / 2) * Math.sin(dlat / 2)
            + Math.cos(lat1) * Math.cos(lat2)
            * Math.sin(dlong / 2) * Math.sin(dlong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    postMessage(d.toFixed(2));
}

//Drag & Drop functions to handle the necessary events for user inputs
function dragend_handler(ev) { }

function dragover_handler(ev) {
    console.log("dragOver");
    ev.preventDefault();
}

function drop_handler(ev) {
    console.log("Drop");
    ev.preventDefault();
    var data = ev.dataTransfer;
    var files = data.files;
    processFiles(files);
}

function processFiles(files) {
    var file = files[0];
    var reader = new FileReader();
    reader.onload = function (event) {
        geoMain(event.target.result);
    };
    reader.readAsText(file);
}
