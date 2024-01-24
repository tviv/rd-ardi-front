function getJsonAnswer(response) {
    return checkStatus(response).then(parseJSON);
}

function checkStatus(response) {
    return new Promise((resolve, reject) => {
        if (response.status >= 200 && response.status < 300) {
            resolve(response);
        } else {
            const error = new Error(`HTTP Error ${response.statusText}`);
            error.status = response.status;
            error.response = response;
            // console.log(error); // eslint-disable-line no-console
            // throw error;
            reject(error);
        }
    });
}

function parseJSON(response) {
    return response.json();
}

function getJsonFromOlapApi(relPath, body, username, password) {
    return new Promise((resolve, reject) => {
        setTimeout(function() {
            let authString =
                username && password
                    ? 'Basic ' + btoa(unescape(encodeURIComponent(`${username}:${password}`)))
                    : `Bearer ${localStorage.getItem('token')}`;
            fetch('' + relPath, {
                accept: 'application/json',
                timeout: 120000,
                method: 'POST',
                headers: {
                    Authorization: authString,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })
                .then(getJsonAnswer)
                .then(response => {
                    if (response.error) {
                        reject(response.error);
                        return;
                    }

                    resolve(response);
                })
                .catch(e => {
                    //console.log(e);
                    reject(e);
                });
        }, 500);
    });
}

export { getJsonAnswer, getJsonFromOlapApi };
