'use strict';

const qs = require('querystring');
const fetch = require('node-fetch');

const getCode = (event) => {
	var code = null;
	if (event.queryStringParameters && event.queryStringParameters.code) {
		code = event.queryStringParameters.code;
	}
	return code;
};

// https://api.slack.com/docs/oauth
const requestToken = (code) => {
	console.log(`Requesting token with ${code}`);
	if (code === null) { return null; }  // Skip if triggered without code
	const params = {
		client_id: process.env.CLIENT_ID,
		client_secret: process.env.CLIENT_SECRET,
		code
	};
	const url = `https://slack.com/api/oauth.access?${qs.stringify(params)}`;
	console.log(`Fetching ${url}`);
	return fetch(url)
		.then(response => response.json()) // Convert response to JSOJN
		.then((json) => {
			if (json.ok) return json; // Verify is valid JSON
			throw new Error('SlackAPIError');
		});
};

const successResponse = callback => callback(null, {
	statusCode: 302,
	headers: { Location: process.env.INSTALL_SUCCESS_URL }
})

const errorResponse = (error, callback) => {
	console.error(error);
	return callback(null, {
		statusCode: 302,
		headers: { Location: process.env.INSTALL_ERROR_URL }
	});
};

module.exports.handler = (event, context, callback) =>
	Promise.resolve(event)
		.then(getCode)  // Get code from event
		.then(requestToken)  // Exchange code for token
		// .then(saveResponse) // Save token to DDB
		.then(() => successResponse(callback))
		.catch(error => errorResponse(error, callback));
