import axios from 'axios';

const Post = (path, header, data) => {

    const promise = new Promise((resolve, reject) => {

        axios.post(path, data, { 'headers': header, mode: 'cors' },)
            .then((response) => {

                resolve(response.data);
            }, (err) => {

                reject(err);
            })
    })
    return promise;
}

export default Post;