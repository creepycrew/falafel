var assert      = require('assert');
var _ 	        = require('lodash');
var getMissingParams = require('../../lib/bindConnectors/getMissingParams');


describe('#getMissingParams', function () {

	it('should pass - empty array', function () {

		var missingParams = getMissingParams(
			{
				test1: 'test1',
				test2: 123,
				test3: [{}],
				test4: {
					test4Sub: 'test4Sub'
				}
			},
			{

				input: {
					test2: {
						type: 'number',
						required: true
					},
					test3: {
						type: 'array'
					},
					test4: {
						type: 'object',
						properties: {
							test4Sub: {
								type: 'string'
							}
						}
					}
				}

			},
			{

				input: {
					test1: {
						type: 'string',
						required: true
					}
				}

			}

		);

		assert(missingParams.length === 0);

	});

	it('should pass - empty string with emptyRequired true', function () {

		var missingParams1 = getMissingParams(
			{ test1: '' },
			{ input: {} },
			{
				input: {
					test1: {
						type: 'string',
						required: true
					}
				}
			}
		);

		assert.equal(missingParams1.length, 1);

		var missingParams2 = getMissingParams(
			{ test1: '' },
			{ input: {} },
			{
				input: {
					test1: {
						type: 'string',
						required: true,
						minLength: 0
					}
				}
			}
		);

		assert.equal(missingParams2.length, 0);

	});

	it('should fail - array has "test1"', function () {

		var missingParams = getMissingParams(
			{
				test2: 123,
				test3: [{}],
				test4: {
					test4Sub: 'test4Sub'
				}
			},
			{

				input: {
					test2: {
						type: 'number',
						required: true
					},
					test3: {
						type: 'array'
					},
					test4: {
						type: 'object',
						properties: {
							test4Sub: {
								type: 'string'
							}
						}
					}
				}

			},
			{

				input: {
					test1: {
						type: 'string',
						required: true
					}
				}

			}

		);

		assert.equal(missingParams[0], 'test1');

	});

	it('should pass, ignoring globals', function () {

		var missingParams = getMissingParams(
			{
				test2: 123,
				test3: [{}],
				test4: {
					test4Sub: 'test4Sub'
				}
			},
			{
				globals: false,

				input: {
					test2: {
						type: 'number',
						required: true
					},
					test3: {
						type: 'array'
					},
					test4: {
						type: 'object',
						properties: {
							test4Sub: {
								type: 'string'
							}
						}
					}
				}

			},
			{

				input: {
					test1: {
						type: 'string',
						required: true
					}
				}

			}

		);

		assert.notEqual(missingParams[0], 'test1');

	});

	it('should pass even if messageSchema is undefined', function () {

		var missingParams = getMissingParams(
			{
				test1: '123'
			},
			undefined,
			{

				input: {
					test1: {
						type: 'string',
						required: true
					}
				}

			}

		);

		assert(missingParams.length === 0);

	});

	it('should pass even if globalSchema is undefined', function () {

		var missingParams = getMissingParams(
			{
				test1: '123'
			},
			{

				input: {
					test1: {
						type: 'string',
						required: true
					}
				}

			},
			undefined
		);

		assert(missingParams.length === 0);

	});

	it('should pass even if both schemas are undefined', function () {

		var missingParams = getMissingParams(
			{
				test1: '123'
			},
			undefined,
			undefined
		);

		assert(missingParams.length === 0);

	});

	it('should fail if property is null and null is not a specified type', function () {

		var missingParams1 = getMissingParams(
			{
				test1: null,
				test2: null
			},
			{

				input: {
					test2: {
						type: ['number', 'null'],
						required: true
					}
				}

			},
			{
				input: {
					test1: {
						type: 'null',
						required: true
					}
				}
			}
		);

		assert(missingParams1.length === 0);


		var missingParams2 = getMissingParams(
			{
				test1: null,
				test2: null
			},
			{

				input: {
					test2: {
						type: ['number'],
						required: true
					}
				}

			},
			{
				input: {
					test1: {
						type: 'string',
						required: true
					}
				}
			}
		);

		assert(missingParams2.length === 2);

	});


	it('should handle the new schema format where properties are declared at the top', function () {

		var missingParams = getMissingParams(
			{
				my_other_param: 'chris'
			},
			{
				input: {
					my_param: {
						type: 'number',
					},
					my_other_param: {
						type: 'string'
					}
				},
				required: ['my_param']
			},
			undefined
		);

		assert.equal(missingParams[0], 'my_param');
	})

	it('should work with the new schema format where properties are declared at the top (global)', function () {

		var missingParams = getMissingParams(
			{
				my_other_param: 'chris'
			},
			{
				input: {
					my_param: {
						type: 'number',
						required: true
					},
					my_other_param: {
						type: 'string'
					}
				},
			},
			{
				input: {
					api_key: {
						type: 'string',
					}
				},
				required: ['api_key']
			}
		);

		assert.equal(missingParams[0], 'my_param');
		assert.equal(missingParams[1], 'api_key');
	})


});
