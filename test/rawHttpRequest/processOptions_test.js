const assert = require('assert');
const fs = require('fs');
const { PassThrough } = require('stream');

const _ = require('lodash');

const processOptions = require('../../lib/rawHttpRequest/processOptions.js');

describe('processOptions', () => {

	it('should be a function', () => {
		assert(_.isFunction(processOptions));
	});

	it('should set headers', () => {

		const sampleParams = {
			body: {
				raw: 'Hello world',
			},
			processedBody: 'Hello world',
			headers: [
				{
					key: 'Authorization',
					value: 'Bearer test'
				}
			]
		};

		const processedOptions = processOptions(sampleParams);

		assert.deepEqual(
			processedOptions.headers,
			{
				Authorization: 'Bearer test',
				'Content-Type': 'text/plain'
			}
		);

	});

	describe('should process content type based on body, and set json and multipart flags', async () => {

		it('raw - string', () => {

			const processedOptions = processOptions({
				body: {
					raw: 'Hello world',
				},
				processedBody: 'Hello world'
			});

			assert.deepEqual(
				processedOptions.headers,
				{
					'Content-Type': 'text/plain'
				}
			);
			assert.strictEqual(processedOptions.json, false);
			assert.strictEqual(processedOptions.multipart, false);

		});

		it('raw - object', () => {

			const processedOptions = processOptions({
				body: {
					raw: {
						test: 'Hello world'
					},
				},
				processedBody: {
					test: 'Hello world'
				}
			});

			assert.deepEqual(
				processedOptions.headers,
				{
					'Content-Type': 'application/json'
				}
			);
			assert.strictEqual(processedOptions.json, true);
			assert.strictEqual(processedOptions.multipart, false);

		});

		it('form_data', () => {

			const processedOptions = processOptions({
				body: {
					form_data: {
						test: 'Hello world'
					},
				},
				processedBody: {
					test: 'Hello world'
				}
			});

			assert.deepEqual(
				processedOptions.headers,
				{
					'Content-Type': 'multipart/form-data'
				}
			);
			assert.strictEqual(processedOptions.json, false);
			assert.strictEqual(processedOptions.multipart, true);

		});

		it('form_urlencoded', () => {

			const processedOptions = processOptions({
				body: {
					form_urlencoded: {
						test: 'Hello world'
					},
				},
				processedBody: {
					test: 'Hello world'
				}
			});

			assert.deepEqual(
				processedOptions.headers,
				{
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			);
			assert.strictEqual(processedOptions.json, false);
			assert.strictEqual(processedOptions.multipart, false);

		});

		it('binary', () => {

			const passThrough = new PassThrough();
			passThrough.end('Hello World');

			const processedOptions = processOptions({
				body: {
					binary: {
						//file object
					},
				},
				processedBody: passThrough
			});

			assert.deepEqual(
				processedOptions.headers,
				{
					'Content-Type': 'text/plain'
				}
			);
			assert.strictEqual(processedOptions.json, false);
			assert.strictEqual(processedOptions.multipart, false);

		});

	});

	it('should use user defined Content-Type of processed value', () => {

		const sampleParams = {
			body: {
				raw: {
					test: 'Hello world'
				},
			},
			processedBody: 'Hello world',
			headers: [
				{
					key: 'Content-Type',
					value: 'application/vnd+json'
				}
			]
		};

		const processedOptions = processOptions(sampleParams);

		assert.deepEqual(
			processedOptions.headers,
			{
				'Content-Type': 'application/vnd+json'
			}
		);

	});

});
