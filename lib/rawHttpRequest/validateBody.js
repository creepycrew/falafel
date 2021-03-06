const keyError = new Error('The `body` object must contain only one of the following valid properties: `raw`, `form_urlencoded`, `form_data`, `binary`, or `none`.');

function checkForValidBodyKey (body) {
	const bodyKeys = _.keysIn(body);

	if (bodyKeys.length !== 1) {
		throw keyError;
	}

	switch (bodyKeys[0]) {
		case 'raw':
		case 'form_urlencoded':
		case 'form_data':
		case 'binary':
		case 'none':
			break;
		default:
			throw keyError;
	}
}

module.exports = function ({ method, body }) {

	switch (method.toLowerCase()) {
		case 'get':
		case 'head':
		case 'options':
			//No body should be processed for these HTTP verbs.
			return false;
		default: {
			if (_.isUndefined(body)) {
				throw new Error('`body` must be supplied. Please select a valid "Body Type".');
			} else {
				checkForValidBodyKey(body);
				return true;
			}
		}
	}

};
