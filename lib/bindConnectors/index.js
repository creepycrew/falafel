/*
* Given the connectors config, fully bind all of the operations in-line
* with the node connector sdk. Throws error if validations fail. We don't
* wanna be starting a server with invalid config.
*/
var util 	 		  = require('util');
var _ 				  = require('lodash');
var when 		 	  = require('when');
var formatError 	  = require('./formatError');
var formatMessage     = require('./formatMessage');
var bindMessageHooks  = require('./bindMessageHooks');
var parseConfig		  = require('../parseConfig');



module.exports = function (config, options) {
	// console.log(util.inspect(config, false, null));

	var messageHooks = bindMessageHooks(config, options);


	// Return a message handler function. This is what is exported
	// at the top level.
	return function (events, context, callback) {

		// Dont wait for event loop to be empty when callback is called
		context.callbackWaitsForEmptyEventLoop = false;

		var promiseTimeout = (
			_.isPlainObject(context) && _.isFunction(context.getRemainingTimeInMillis) ?
			context.context.getRemainingTimeInMillis() - 10 :
			0
		);

		// The array of events should all be executed in parallel
		var promises = _.map(events, function (event) {

			var messagePromise = when.promise(function (resolve, reject) {

				// Handle error invalid payload
				if (!event.header || !event.header.message) {
					return resolve(formatError(
						{
							headers: {},
							body: {
								code: 'invalid_input',
								message: 'Invalid message received.'
							}
						},
						event
					));
				}


				var hooks;

				// TEST MODE
				// If the event header has the `test_config` key passed in, this should be treated
				// as a total override, as we're in test mode. In this case, parse the `test_config`
				// and re-bind the message hooks
				if (_.isString(event.header.test_config)) {
					var testConfig = parseConfig(event.header.test_config);
					hooks = bindMessageHooks(testConfig, options);
				} else {
					hooks = messageHooks;
				}


				// Handle message not existing
				if (!_.isFunction(hooks[event.header.message])) {
					return resolve(formatError(
						{
							headers: {},
							body: {
								code: 'not_implemented',
								message: 'Could not find a valid message handler for ' + event.header.message
							}
						},
						event
					));
				}

				// Got this far? All good, let's run

				// NOTE: we actually need try catch as when.js
				// promises catch errors in the reject anyway.

				// Run the API call, and respond with the appropriate stuff
				hooks[event.header.message](event)

				.done(
					function (response) {
						resolve((
							_.isError(response.body) ?
							formatError(response, event) :
							formatMessage(event, response, response.version)
						));
					},
					function (response) {
						resolve(formatError(response, event));
					}
				);

			});

			if (promiseTimeout) {

				messagePromise

				.timeout(promiseTimeout)

				//Perform this catch only if it is due to timeout
				.catch(when.TimeoutError, function () {
					// eslint-disable-next-line no-console
					console.warn('The promise has not been closed within the time limit.');
					return when.reject(formatError(
						{
							code: '#fatal_error',
							message: 'The operation timed out.',
							payload: 'The operation has timed out due to the promise not closing (resolving/rejecting) within the time limit.'
						},
						event
					));
				});

			}


			return messagePromise;

		});

		// Wait for all of the above to finish, then resolve
		when.all(promises).done(function (result) {
			callback(null, result);
		}, function (err) {
			callback(err, []);
		});

	};

};
