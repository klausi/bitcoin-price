// Fetch price data from Coindesk API.
var getJSON = function (url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function () {
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
getJSON('https://api.coinmarketcap.com/v1/ticker/?convert=EUR&limit=15',
  function (err, data) {
    if (err !== null) {
      alert('Something went wrong: ' + err);
    } else {
      json = data;
      // Add available crypto currencies to the select box for adding.
      select = document.getElementById('add_coin');
      for (var i = 0, len = json.length; i < len; i++) {
        // If a URL query parameter is set for a crypto currency: Add a row for
        // it.
        var parameter_name = json[i].symbol.toLowerCase() + "_amount";
        var amount = getParameterByName(parameter_name);
        if (amount === null) {
          var opt = document.createElement('option');
          opt.value = json[i].symbol;
          opt.id = 'opt_' + json[i].symbol;
          opt.innerHTML = json[i].name + ' (' + json[i].symbol + ')';
          select.appendChild(opt);
        }
        else {
          addRow(json[i], amount);
        }
      }
      document.getElementById("last_update").innerHTML = Date();

      var currency = getParameterByName('currency');
      if (currency !== null) {
        currency = currency.toLowerCase();
        if (currency == 'eur') {
          document.getElementById("currency-eur").checked = 1;
          document.getElementById("currency-usd").checked = 0;
        }
        if (currency == 'usd') {
          document.getElementById("currency-eur").checked = 0;
          document.getElementById("currency-usd").checked = 1;
        }
      }

      calculate();
    }
  });


// Add row when the submit button is triggered.
function processForm(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  var symbol = document.getElementById('add_coin').value;
  for (var i = 0, len = json.length; i < len; i++) {
    if (json[i].symbol == symbol) {
      var amount_element = document.getElementById('add_amount');
      addRow(json[i], amount_element.value);

      // Clear the amount and remove added coin from select list.
      amount_element.value = '';
      var option = document.getElementById('opt_' + json[i].symbol);
      option.parentNode.removeChild(option);
      break;
    }
  }
  calculate();
  return false;
}

// Register event listener when form is submitted.
var form = document.getElementById('calculator');
if (form.attachEvent) {
  form.attachEvent("submit", processForm);
}
else {
  form.addEventListener("submit", processForm);
}
// Register event listener to trigger whenever the currency is changed.
var currency_options = document.getElementsByName("currency");
for (var i = 0, length = currency_options.length; i < length; i++) {
  if (currency_options[i].attachEvent) {
    currency_options[i].attachEvent("change", calculate);
  }
  else {
    currency_options[i].addEventListener("change", calculate);
  }
}

// Calculate current price from amounts.
function calculate() {
  var total = 0;
  var currency = document.querySelector('input[name="currency"]:checked').value;

  for (var i = 0, len = json.length; i < len; i++) {
    var rate_id = json[i].symbol.toLowerCase() + "_rate";
    var rate_span = document.getElementById(rate_id);
    if (rate_span !== null) {
      var rate;
      if (currency == 'eur') {
        rate = json[i].price_eur;
      }
      else {
        rate = json[i].price_usd;
      }
      rate_span.innerHTML = parseFloat(rate).formatMoney();

      var amount_id = json[i].symbol.toLowerCase() + "_amount";
      var result = rate * document.getElementById(amount_id).value;
      var result_id = json[i].symbol.toLowerCase() + "_result";
      // Pretty format that number.
      document.getElementById(result_id).innerHTML = result.formatMoney();
      // Also update the query parameter in the URL.
      var newUrl = updateURLParameter(window.location.href, amount_id, document.getElementById(amount_id).value);
      window.history.replaceState('', '', newUrl);
      total += result;
    }
  }
  var currency_spans = document.getElementsByClassName("currency");
  for (var i = 0, len = currency_spans.length; i < len; i++) {
    currency_spans[i].innerHTML = currency.toUpperCase();
  }
  // Also update the currency query parameter in the URL.
  var newUrl = updateURLParameter(window.location.href, 'currency', currency);
  window.history.replaceState('', '', newUrl);

  document.getElementById("total").innerHTML = total.formatMoney();
}

// Add a row for a crypto coin with the given float amount.
function addRow(coin_data, amount) {
  var result_id = coin_data.symbol.toLowerCase() + "_result";
  var rate_id = coin_data.symbol.toLowerCase() + "_rate";
  var parameter_name = coin_data.symbol.toLowerCase() + "_amount";
  var currency = document.querySelector('input[name="currency"]:checked').value.toUpperCase();
  var row = '<div class="col col-name">' + coin_data.name + '<br>(1 ' + coin_data.symbol + ' = <span id="' + rate_id + '">0</span> <span class="currency">' + currency + '</span>)</div>';
  row += '<div class="col col-amount"><input type="text" id="' + parameter_name + '" name="' + parameter_name + '" value="' + amount + '" size="10"></div>';
  row += '<div class="col col-result"><div><span id="' + result_id + '" class="item-result">0</span> <span class="currency">' + currency + '</span></div></div>';
  var div = document.createElement('div');
  div.innerHTML = row;
  div.classList.add('item_row');

  var coins_div = document.getElementById('coins');
  coins_div.appendChild(div);

  // Register event listener to trigger whenever the input is changed.
  input = document.getElementById(parameter_name);
  if (input.attachEvent) {
    input.attachEvent("input", calculate);
  }
  else {
    input.addEventListener("input", calculate);
  }
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

  if (additionalURL) {
    var tmpAnchor = additionalURL.split("#");
    var TheParams = tmpAnchor[0];
    TheAnchor = tmpAnchor[1];
    if (TheAnchor)
      additionalURL = TheParams;

    tempArray = additionalURL.split("&");

    for (var i = 0; i < tempArray.length; i++) {
      if (tempArray[i].split('=')[0] != param) {
        newAdditionalURL += temp + tempArray[i];
        temp = "&";
      }
    }
  }
  else {
    var tmpAnchor = baseURL.split("#");
    var TheParams = tmpAnchor[0];
    TheAnchor = tmpAnchor[1];

    if (TheParams)
      baseURL = TheParams;
  }

  if (TheAnchor)
    paramVal += "#" + TheAnchor;

  var rows_txt = temp + "" + param + "=" + paramVal;
  return baseURL + "?" + newAdditionalURL + rows_txt;
}

// Pretty formatting for numbers.
Number.prototype.formatMoney = function (places, thousand, decimal) {
  places = !isNaN(places = Math.abs(places)) ? places : 2;
  thousand = thousand || ",";
  decimal = decimal || ".";
  var number = this,
    negative = number < 0 ? "-" : "",
    i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
    j = (j = i.length) > 3 ? j % 3 : 0;
  return negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
};
