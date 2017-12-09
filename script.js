// Set the amount text field from a query parameter value if present.
var btc_amount = getParameterByName('btc_amount');
if (btc_amount === null) {
  document.getElementById('btc_amount').value = 1;
}
else {
  document.getElementById('btc_amount').value = btc_amount;
}

// Recalculate the form when the submit button is triggered. 
function processForm(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  calculate();
  return false;
}

var form = document.getElementById('calculator');
if (form.attachEvent) {
  form.attachEvent("submit", processForm);
}
else {
  form.addEventListener("submit", processForm);
}

// Fetch price data from Coindesk API.
var getJSON = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function() {
    var status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    }
    else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
};
var json;
getJSON('https://api.coindesk.com/v1/bpi/currentprice/EUR.json',
function(err, data) {
  if (err !== null) {
    alert('Something went wrong: ' + err);
  } else {
    json = data;
    calculate();
  }
});

// Calculate current price from amount.
function calculate() {
  var result = json.bpi.EUR.rate_float * document.getElementById("btc_amount").value;
  // Pretty format that number.
  document.getElementById("result").innerHTML = result.formatMoney();
    // Also update the query parameter in the URL.
  var newUrl = updateURLParameter(window.location.href, "btc_amount", document.getElementById("btc_amount").value);
  window.history.replaceState('', '', newUrl);
}

// Returns a query parameter for the given URL or the current URL.
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// Set a query parameter in a URL.
function updateURLParameter(url, param, paramVal) {
  var TheAnchor = null;
  var newAdditionalURL = "";
  var tempArray = url.split("?");
  var baseURL = tempArray[0];
  var additionalURL = tempArray[1];
  var temp = "";

  if (additionalURL) 
  {
      var tmpAnchor = additionalURL.split("#");
      var TheParams = tmpAnchor[0];
          TheAnchor = tmpAnchor[1];
      if(TheAnchor)
          additionalURL = TheParams;

      tempArray = additionalURL.split("&");

      for (var i=0; i<tempArray.length; i++)
      {
          if(tempArray[i].split('=')[0] != param)
          {
              newAdditionalURL += temp + tempArray[i];
              temp = "&";
          }
      }        
  }
  else
  {
      var tmpAnchor = baseURL.split("#");
      var TheParams = tmpAnchor[0];
          TheAnchor  = tmpAnchor[1];

      if(TheParams)
          baseURL = TheParams;
  }

  if(TheAnchor)
      paramVal += "#" + TheAnchor;

  var rows_txt = temp + "" + param + "=" + paramVal;
  return baseURL + "?" + newAdditionalURL + rows_txt;
}

// Pretty formatting for numbers.
Number.prototype.formatMoney = function(places, thousand, decimal) {
	places = !isNaN(places = Math.abs(places)) ? places : 2;
	thousand = thousand || ",";
	decimal = decimal || ".";
	var number = this, 
	    negative = number < 0 ? "-" : "",
	    i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
	    j = (j = i.length) > 3 ? j % 3 : 0;
	return negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
};
