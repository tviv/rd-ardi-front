function getJsonAnswer (response) {
  return checkStatus(response).then(parseJSON);
}


function checkStatus(response) {
  return new Promise((resolve, reject) => {
    if (response.status >= 200 && response.status < 300) {
      resolve(response);
    } else {
      const error = new Error(`HTTP Error ${response.statusText}`);
      error.status = response.statusText;
      error.response = response;
      // console.log(error); // eslint-disable-line no-console
      // throw error;
      reject(error);
    }
  });
}

function parseJSON(response) {
  console.dir(response);
  return response.json();
}

function getJsonFromOlapApi(relPath, body) {

  return new Promise((resolve, reject) => {
    setTimeout(function () {

      fetch('http://localhost:3101' + relPath, {accept: 'application/json',
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
        .then(getJsonAnswer)
        .then(response=>{
          if (response.error) {
            reject(response.error);
            return;
          }

          resolve(response);
        })
        .catch((e) => {
          console.log(e);
          reject('Произошла ошибка при загрузке данных')
        });

    }, 500);
  });

}

export {getJsonAnswer, getJsonFromOlapApi};
