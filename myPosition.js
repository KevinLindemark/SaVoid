// IMAGES

let images = ['hello', 'female-police-officer','man-frowning','police-officer','pouting-face','woman-zombie']

// get position from user

var options = {
  enableHighAccuracy: true,
  timeout: 27000,
  maximumAge: 0
};

function success(pos) {
// variable holds position coords
  var crd = {lat: pos.coords.latitude, lon: pos.coords.longitude};
  console.log("crd: ", crd);
  sendMessage(crd);
  receiveMessage(crd);
 
/*
  console.log('Your current position is:');
  console.log(`Latitude : ${crd.latitude}`);
  console.log(`Longitude: ${crd.longitude}`);
  console.log(`More or less ${crd.accuracy} meters.`);
  */
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.watchPosition(success, error, options); 

/************** LOCATION END ***** MQTT START ********/
// trying to see if I can send and recive position coords via MQTT
// Setup
const broker = "influx.itu.dk";
const port = 9002;
const secured = true;
const topic = "ituF2020/EXPD/DI-SaVoid";
let clientId = "ok";

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkCookie() {
  var user = getCookie("username");
  if (user != "") {
    alert("Welcome again " + user);
    clientId = getCookie("username");
    console.log("usernameCookie: ");
    console.log(clientId);
  } else {
    user = prompt("Please enter your name:", "");
    if (user != "" && user != null) {
      setCookie("username", user, 365);

      // trying to set random image from images array to cookie for userImg
/*
      var images = items[Math.floor(Math.random() * images.length)];
      console.log("images: ",images);
      setCookie("userImg", images, 365);
      var userImg = getCookie("userImg");
      console.log("userImg: ", userImg);
*/



    }
  }
}
checkCookie(); 



 //clientId = "clientID_" + parseInt(Math.random() * 1000);

//console.log("cookieAsId ");
 // console.log(document.cookie);
 // let cookieAsId = document.cookie; 
 // fix cookie name so it works first time loading the page


// Create a client instance
let client = new Paho.MQTT.Client(broker, Number(port), clientId);
console.log("let client: ");
console.log(client);

// connect the client
client.connect({
    onSuccess: onConnect,
    useSSL: secured,
});

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = receiveMessage;

// called when the client connects
function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("onConnect");
    client.subscribe(topic);
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost: " + responseObject.errorMessage);
    }
}

// call to send a message
function sendMessage(msg) {
   // document.cookie = "username=" + clientIdReceived;    
    console.log("sendMessage: " )
    console.log(msg);
    let mObj = { deviceId: clientId, content: msg };
    let mSend = new Paho.MQTT.Message(JSON.stringify(mObj));
    mSend.destinationName = topic;
    console.log("mSend: ");
    console.log(mSend);
    client.send(mSend);
}

// called when a message arrives
function receiveMessage(msg) {
    console.log("msg :");
    console.log(msg);
    let mUnpack = JSON.parse(msg.payloadString);
  console.log("mUnpack: ");
  console.log(mUnpack);
    let receivedMessage = mUnpack.content;
    let clientIdReceived = mUnpack.deviceId;
   console.log("clientRecieved: ");
   console.log(clientIdReceived);
   
    //let userCoords = [lat, lon];
    console.log("recievedMessage: ")
    console.log(receivedMessage);
    
  //console.log("cookieAsId ");
  //console.log(document.cookie);
  changeMap(receivedMessage, clientIdReceived);

}
function changeMap(latlng, user, userImg) {

  // need to re-render the images on new position instead of drawing a new one for each update
  // get a random emoji - maybe save some to array and give a random and save in cookie
  // use users radius to geofence and give alert when close to others
  // get distance between users
  console.log("latlng.lat: ");
  console.log(latlng.lat);
  console.log("latlng.lon: ");
  console.log(latlng.lon);
  
  var userIcon = L.icon({
    iconUrl: `img/hello.png`,
    //iconUrl: `img/${userImg}.png`,
    
    iconSize: [38, 45], // size of the icon

    iconAnchor: [38, 45], // point of the icon which will correspond to marker's location

    popupAnchor: [-20, -42] // point from which the popup should open relative to the iconAnchor
  });
//console.log("distance in meters: " +distance(latlng, crd));
  if (user !== getCookie("username")) {
  L.marker([latlng.lat, latlng.lon], { icon: userIcon }).addTo(map)
    .bindPopup("Here is " + user).openPopup();
    }
     

}