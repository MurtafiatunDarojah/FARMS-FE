import axios from 'axios';

const Put = (path, header, data) => {

    const promise = new Promise((resolve, reject) => {
        axios.put(path, data, { 'headers': header, mode: 'cors' },)
            .then((response) => {
                resolve(response.data);
            }, (err) => {

                reject(err);
            })
    })
    return promise;
}

export default Put;