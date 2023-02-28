import fetch from 'node-fetch';

class HttpError extends Error {
    constructor(response) {
        super(`${response.status} for ${response.url}`);
        this.name = 'HttpError';
        this.response = response;
    }
}

async function loadJson(url) {
    let response = await fetch(url)

    if (response.status === 200) {
        return response.json();
    } else {
        throw new HttpError(response);
    }

}

// Ask for a user name until github returns a valid user
async function demoGithubUser() {
    let user;
    let name = "iliakan";

    try {
        user = await loadJson(`https://api.github.com/users/${name}`);

    } catch(err) {
        if (err instanceof HttpError && err.response.status == 404) {
            // loop continues after the alert
            console.log("No such user, please reenter.");
        } else {
            // unknown error, rethrow
            throw err;
        }
    }

    console.log(`Full name: ${user.name}.`);
    return user;
}


demoGithubUser();