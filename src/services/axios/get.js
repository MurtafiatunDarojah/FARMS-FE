import axios from 'axios'

const Get = (path, headers) => {
    const promise = new Promise((resolve, reject) => {
        axios({ method: 'GET', url: path, headers: headers }).then((response) => {
            resolve(response.data)
        }, (err) => {
            reject(err)
        })
    })
    return promise;
}

export default Get;
