let coinsArray = [];
let coinDiv;
let ChartInterval;
(function () {
  $(function () {
    let url = "https://api.coingecko.com/api/v3/coins";
    $.get(url)
      .then((coins) => {
        coinsArray = coins;
        clearInterval(ChartInterval);
        showCoins(coinsArray);
      })
      .catch((e) => {
        console.error(e);
        alert("Failed To Load Coins");
      });
  });
})();

function showCoins(coins) {
  for (let index = 0; index < coins.length; index++) {
    addCoinToUi(coins[index]);
    showMoreInfo(coins[index].id);
  }
}

function addCoinToUi(coin) {
  coinDiv =
    $(` <div class=" mainCoinCard card position-relative shadow-lg  m-3 bg-light d-flex flex-column  style="width: 18rem;"" id="${coin.symbol}">
  <div class="card-body m-1">
    <img class="card-img-small" src="${coin.image.small}" />
  </div>
  <h5 class="card-title m-4 my-1">${coin.name}</h5>
  <p class="card-text m-4 my-1">${coin.symbol}</p>
  <div class="custom-control custom-switch d-flex justify-content-end m-3">
    <input
      type="checkbox"
      class="custom-control-input"
      id="check${coin.symbol}"
      onchange="onToggleClick(this,'${coin.symbol}')"
    />
  </div>
  <button
      class="moreInfo collapsed btn btn-secondary btn-sm"
      id="moreInfo${coin.id}"
      data-toggle="collapse"
      data-target="#${coin.id}"
    >
      More Info
    </button>
    <div class="moreInfoDiv card-text">
    <div class="infoDiv collapse show card-text" id="open${coin.id}">
      <div class="card collapse in card-text" id="${coin.id}"></div>
  </div>
  </div>
  </div>

  `);
  $(".container-fluid").append(coinDiv);
}

let coins = new Map();
function showMoreInfo(coinId) {
  $(`#moreInfo${coinId}`).on("click", function () {
    if (coins.has(coinId)) {
      let cachedCoin = coins.get(coinId);
      getMoreInfoData(coinId, cachedCoin);
    } else {
      $.get(`https://api.coingecko.com/api/v3/coins/${coinId}`)
        .then((coin) => {
          let newCoin = coin.market_data.current_price;
          getMoreInfoData(coinId, newCoin);
          coins.set(coin.id, {
            ils: coin.market_data.current_price.ils,
            usd: coin.market_data.current_price.usd,
            eur: coin.market_data.current_price.eur,
          });
          setTimeout(() => coins.delete(coin.id), 120000);
        })
        .catch((e) => {
          console.error(e);
          alert("Failed To Load More Info");
        });
    }
  });
}

function getMoreInfoData(coinId, coin) {
  $(`#${coinId}.card`).html(`
      <div class="card-text shadow-lg d-flex flex-column justify-content-center ">
          <div class="d-flex justify-content-center m-2 fas fa-shekel-sign"> ${coin.ils}</div>
          <div class=" d-flex justify-content-center m-2 fas fa-dollar-sign"> ${coin.usd}</div>
          <div class=" d-flex justify-content-center m-2 fas fa-euro-sign"> ${coin.eur}</div>
      </div`);
}

let selectedCoins = [];
let selectedToggleIds = [];
let togglesCounter = 0;

function onToggleClick(currentToggle, coinSymbol) {
  let toggleId = currentToggle.id;
  let SymbolCoinIndex = selectedCoins.indexOf(coinSymbol);
  let indexToggleId = selectedToggleIds.indexOf(toggleId);

  if (SymbolCoinIndex != -1) {
    selectedCoins.splice(SymbolCoinIndex, 1);
    selectedToggleIds.splice(indexToggleId, 1);
  } else {
    if (selectedCoins.length < 5) {
      togglesCounter++;
      selectedCoins.push(coinSymbol);
      selectedToggleIds.push(toggleId);
    } else {
      $("#modalBody").empty();
      $(`#${toggleId}`).prop("checked", false);

      $(".modal-title").html(
        ' Can Only Select 5 Coins. To add the "<b id="b">' +
        coinSymbol.toUpperCase() +
        '</b>" coin, you must unselect one of the following coins: <br>'
      );
      $("#myModal").css("display", "block");

      $("#keepCurrent").on("click", () => {
        $("#myModal").css("display", "none");
      });

      let counterId = 1;

      for (let index = 0; index < selectedCoins.length; index++) {
        $("#modalBody").append(
          `<div id="modalDiv">
                    <div class="card position-relative bg-light m-2" id="modalCard">
                        <div class="card-body shadow" id="modalCardBody">
                            <h6 id="modalCoinName" class="card-title">${selectedCoins[
            index
          ].toUpperCase()}</h6>
                            <label class="switch" id="modalSwitch">
                                <input type="checkbox" class="checkboxes" id="chosenToggle${counterId}"><span class="slider round" id="modalslider"></span>
                            </label>
                        </div>    
                    </div>
                </div>`
        );

        $(`#chosenToggle${counterId}`).prop("checked", true);
        $(`#chosenToggle${counterId}`).on("change", () => {
          let indexCoinRemove = selectedCoins.indexOf(selectedCoins[index]);
          let ToggleTofalse = selectedToggleIds[indexCoinRemove];
          selectedCoins.splice(indexCoinRemove, 1);
          selectedToggleIds.splice(indexCoinRemove, 1);
          selectedCoins.push(coinSymbol);
          selectedToggleIds.push(toggleId);
          $("#myModal").css("display", "none");
          $(`#${ToggleTofalse}`).prop("checked", false);
          doubleCheckToggle();
        });
        counterId++;
      }
    }
  }
}

function doubleCheckToggle() {
  for (let index = 0; index < selectedToggleIds.length; index++) {
    $(`#${selectedToggleIds[index]}`).prop("checked", true);
  }
}

$("#home").click(function () {
  clearInterval(ChartInterval);
  $(".container-fluid").empty();
  let coinsToShow = showCoins(coinsArray);
  doubleCheckToggle();
  $(".container-fluid").append(coinsToShow);
});

$("#liveReports").click(function () {
  clearInterval(ChartInterval);
  doubleCheckToggle();
  if (selectedCoins == 0) {
    alert("You must Select at Least One Coin");
    return;
  }

  $(".container-fluid").empty();
  let firstCoinSelected = [];
  let secondCoinSelected = [];
  let thirdCoinSelected = [];
  let fourthCoinSelected = [];
  let fifthCoinSelected = [];
  let coinKeysArray = [];

  ChartInterval = setInterval(() => {
    getDataFromApi();
  }, 2000);

  function getDataFromApi() {
    let url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCoins[0]},${selectedCoins[1]},${selectedCoins[2]},${selectedCoins[3]},${selectedCoins[4]}&tsyms=USD`;
    $.get(url).then((result) => {
      $(".container-fluid").html(
        `<div id="chartContainer" style="height: 550px; width: 100%;"></div>`
      );
      let currentTime = new Date();
      let coinCounter = 1;
      for (let key in result) {
        if (coinCounter == 1) {
          firstCoinSelected.push({ x: currentTime, y: result[key].USD });
          coinKeysArray.push(key);
        }
        if (coinCounter == 2) {
          secondCoinSelected.push({ x: currentTime, y: result[key].USD });
          coinKeysArray.push(key);
        }
        if (coinCounter == 3) {
          thirdCoinSelected.push({ x: currentTime, y: result[key].USD });
          coinKeysArray.push(key);
        }
        if (coinCounter == 4) {
          fourthCoinSelected.push({ x: currentTime, y: result[key].USD });
          coinKeysArray.push(key);
        }
        if (coinCounter == 5) {
          fifthCoinSelected.push({ x: currentTime, y: result[key].USD });
          coinKeysArray.push(key);
        }
        coinCounter++;
      }
      createChart();
    });
  }

  function createChart() {
    let options = {
      animationEnabled: false,
      backgroundColor: "white",
      title: {
        text: "Crypto Coins Live Currencies",
      },
      axisX: {
        ValueFormatString: "HH:mm:ss",
        titleFontColor: "red",
        lineColor: "red",
        labelFontColor: "red",
        tickColor: "red",
      },
      axisY: {
        suffix: "$",
        titleFontColor: "#4F81BC",
        lineColor: "#4F81BC",
        labelFontColor: "#4F81BC",
        tickColor: "#4F81BC",
      },
      toolTip: {
        shared: true,
      },
      data: [
        {
          type: "spline",
          name: coinKeysArray[0],
          showInLegend: true,
          xValueFormatString: "HH:mm:ss",
          dataPoints: firstCoinSelected,
        },
        {
          type: "spline",
          name: coinKeysArray[1],
          showInLegend: true,
          xValueFormatString: "HH:mm:ss",
          dataPoints: secondCoinSelected,
        },
        {
          type: "spline",
          name: coinKeysArray[2],
          showInLegend: true,
          xValueFormatString: "HH:mm:ss",
          dataPoints: thirdCoinSelected,
        },
        {
          type: "spline",
          name: coinKeysArray[3],
          showInLegend: true,
          xValueFormatString: "HH:mm:ss",
          dataPoints: fourthCoinSelected,
        },
        {
          type: "spline",
          name: coinKeysArray[4],
          showInLegend: true,
          xValueFormatString: "HH:mm:ss",
          dataPoints: fifthCoinSelected,
        },
      ],
    };
    $("#chartContainer").CanvasJSChart(options);
    $(".container-fluid").append(options);
  }
});

$("#about").click(function () {
  clearInterval(ChartInterval);
  doubleCheckToggle();
  $(".container-fluid").empty();
  let aboutDiv = `<div class="card m-5 shadow-lg bg-light" id="aboutCard">
  <h5 class="mt-2 mx-5">About The Project</h5>
  <p class="mx-5">This Project is a website that provides live value updates of crypto coins.</p>
  </div>`;
  $(".container-fluid").append(aboutDiv);
});

$("#searchButton").click(function () {
  let userSearchValue = $("#search-input").val().toLowerCase();
  $.get(`https://api.coingecko.com/api/v3/coins/${userSearchValue}`)
    .then((searchedCoin) => {
      if (userSearchValue == "") {
        alert("Field cannot be empty");
        return
      }
      clearInterval(ChartInterval);
      $(".container-fluid").empty();
      addCoinToUi(searchedCoin);
      showMoreInfo(searchedCoin.id);
    })
    .catch(() => {
      alert("Cannot find matching coin")
    })
})
