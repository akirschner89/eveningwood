require('dotenv').config()
const http = require('https')

const clientId = process.env.CLIENT_ID; 
const clientSecret = process.env.CLIENT_SECRET;

// below object will hold all response data including fees & ticker
let allTickerData = {}

// TODOs: grab user input to match against the ticket names
// compare the user input tickers to the morningstar api data
// log the output of input ticker & fund names, current value (from user input), annual fee amount per each, total paid in annual fee over last year
// ALSO look for 6 year fees

// first function to get user access token - expires every 60 min
function getToken(output) {
    let auth = "Basic " + new Buffer(clientId + ":" + clientSecret).toString("base64");
    let access_token
    const options = {
        hostname: 'www.us-api.morningstar.com',
        path: '/token/oauth',
        method: 'POST',
        headers: {
            "Authorization": auth
        }
    };

    let request = http.request(options, function (response) {

        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            access_token = JSON.parse(chunk).access_token;
            output(access_token);
        });
    });
    request.end();
}

/* Sample code to show how to generate a new token when the current token expires */
function accessAPIEndpoint(access_token) {
    let auth = "Bearer " + access_token
    const options = {
        hostname: 'www.us-api.morningstar.com',
        path: '/{API_endpoint}', /* {API_endpoint} is just a place holder. Replace it with actual API call that you need. */
        // path: `/portfolioanalysis/v1/hypo/views?langcult=en-US`, -- this might be the endpoint to use, might need other params
        method: 'GET',
        headers: {
            "Authorization": auth
        }
    };

    let request = http.request(options, function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) { 
            return allTickerData = { chunk }
        })
        response.on('end', function () {
            if (response.statusCode == 200) {
                //success & maybe post to local db? info here needs to be surfaced to the user when we find a matching ticker (done on .'data')
            } else if (response.statusCode == 401) {
                // token is expired, so call the getToken method to get a new access token and use it to extend the session
                getToken(function (output) {
                    console.log(output);
                });
            } else {
                console.log(`An error has occurred`)
            }
        });
    });
    request.end();
}
