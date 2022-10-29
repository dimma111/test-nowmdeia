//Вспомогательные данные
const city = "Москва";
const apiKey = "0acdfda0-a8e8-4ed5-b139-71ad0f02bdc2";
const url = "https://geocode-maps.yandex.ru/1.x/?format=json&apikey=";
let points = [];
const sendBtn = document.querySelector("#send");
const textArea = document.querySelector("#inputData");
const loader = document.querySelector("#loader");

//Инициализируем карту яндекс
ymaps.ready(buildMap);

var myMap;

function buildMap() {
  myMap = new ymaps.Map("map", {
    center: [55.751574, 37.573856],
    zoom: 9,
    controls: ["zoomControl"],
  });
}

//Вешаем обработчики событий

sendBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  loader.style.display = "block";
  await parseData(textArea.value); //парсим данные от пользователя
  await fetchYaDecoder(); //получаем координаты от яндекс карт
  yaMapAddPoints(); //наносим их на карту
  loader.style.display = "none";
});

//Парсим данные
function parseData(text) {
  let arr = text.split("\n");

  for (let item of arr) {
    let strArr = item.split(",");
    let address = "";
    let products = "";
    let i = 0;

    for (let str of strArr) {
      str = str.trim();
      i++;

      if (i == 1) {
        address += city + ", " + str + " ";
      } else if (i == 2) {
        if (!/^кв/i.test(str)) {
          if (/^\d/.test(str)) {
            address += str + " ";
          } else if (/^деревня/i.test(str)) {
            address += str + " ";
          } else products += str + " ";
        }
      } else if (i == 3) {
        if (!/^кв/i.test(str)) products += str + ", ";
      } else products += str + ", ";
    }

    points.push({ address: address, products: products.slice(0, -2) });
  }
}

//Получаем координаты от яндекс карт
async function fetchYaDecoder() {
  for (let item of points) {
    let response = await fetch(url + apiKey + "&geocode=" + item.address);
    response = await response.json();

    let coordinate =
      response.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(
        " "
      );

    item["coord"] = coordinate;
  }
}

//Добавляем полученные данные на карту
function yaMapAddPoints() {
  for (let item of points) {
    console.log(item.coord[0]);
    geoObject = new ymaps.GeoObject({
      // Описание геометрии.
      geometry: {
        type: "Point",
        coordinates: [item.coord[1], item.coord[0]],
      },
      // Свойства.
      properties: {
        // Контент метки.
        hintContent: item.products,
        balloonContent: item.products,
      },
    });

    myMap.geoObjects.add(geoObject);
  }
}
