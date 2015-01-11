[![Build Status](https://travis-ci.org/philtoms/mithril-fake-xhr.svg?branch=master)](https://travis-ci.org/philtoms/mithril-fake-xhr)

# Mithril-fake-xhr

A fake XHR handler for testing Mithril apps

## Installation
 ```shell
npm install --save-dev mithril-fake-xhr
```

## Use cases
```javascript

  // pass the window context into the fake
  var fakeXHR = require('mithril-fake-xhr')(mock || window);
  
	// Mocking

	// expected
	test(function() {
		var response = fakeXHR('get','/test1').respondWith('abc')
	  // somewhere in code under test...
	  // sut.method() {
    		m.request({method:'GET', url:'/test1'});
	  // }

		return response.count===1;
	});

	// unexpected
	test(function() {
	  // somewhere in code under test...
	  // sut.method() {
    		m.request({method:'GET', url:'/test/xxx'});
	  // }

		return fakeXHR.unexpectedRequests !== 0;
	});

	// unresolved
	test(function() {
		var response = fakeXHR('get','/test1/yyy').respondWith('abc')

	  // somewhere in code under test...
	  // sut.method() {}

		return response.count === 0;
	});

	// Stubbing

	// GET
	test(function() {
		var data;
		fakeXHR('get','/test2').respondWith('abc')
		m.request({method:'GET', url:'/test2'}).then(function(response){
			data = response;
		});
		return data=='abc';
	});

	// params
	test(function() {
		var data;
		fakeXHR('get','/test3\\?p1=1&p2=2').respondWith({p1:'one',p2:'two'})
		m.request({method:'GET', url:'/test3?p1=1&p2=2'}).then(function(response){
			data = response;
		});
		return data.p1==='one' && data.p2==='two';
	});

	// regex params
	test(function() {
		var data;
		fakeXHR('get','/test3\\?p1=.+&p2=\\d+').respondWith({p1:'ABC',p2:'onetwothree'})
		m.request({method:'GET', url:'/test3?p1=abc&p2=123'}).then(function(response){
			data = response;
		});
		return data.p1==='ABC' && data.p2==='onetwothree';
	});

	// POST
	test(function() {
		var data;
		fakeXHR('post','/test4', {p1:1,p2:2}).respondWith({p1:'one',p2:'two'})
		m.request({method:'POST', url:'/test4', data:{p1:1,p2:2}}).then(function(response){
			data = response;
		});
		return data.p1==='one' && data.p2==='two';
	});

	// PASSTHROUGH
	test(function() {
		var data;
		var response = fakeXHR('get','/test5').passthrough()
		m.request({method:'GET', url:'/test5'}).then(function(response){
			data = response;
		});
		return data==='ABC';
	});

	// errors
	test(function() {
		var data;
		fakeXHR('get','/test6').respondWith(404,'file not found')
		m.request({method:'GET', url:'/test6'}).then(undefined, function(response){
			data=response;
		});
		return data==='file not found';
	});
```

### Copyright

Source code is licensed under the MIT License (MIT). See [LICENSE.txt](./LICENSE.txt)
file in the project root. Documentation to the project is licensed under the
[CC BY 4.0](http://creativecommons.org/licenses/by/4.0/) license. 


