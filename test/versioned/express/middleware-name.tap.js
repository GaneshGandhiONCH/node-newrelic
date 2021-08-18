/*
 * Copyright 2020 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

var test = require('tap').test
var helper = require('../../lib/agent_helper')

test('should name middleware correctly', function (t) {
  var agent = helper.instrumentMockedAgent()

  var app = require('express')()
  var server

  t.teardown(function () {
    server.close()
    helper.unloadAgent(agent)
  })

  app.use('/', testMiddleware)

  server = app.listen(0, function () {
    t.equal(app._router.stack.length, 3, '3 middleware functions: query parser, Express, router')

    var count = 0
    for (var i = 0; i < app._router.stack.length; i++) {
      var layer = app._router.stack[i]

      // route middleware doesn't have a name, sentinel is our error handler,
      // neither should be wrapped.
      if (layer.handle.name && layer.handle.name === 'testMiddleware') {
        count++
      }
    }
    t.equal(count, 1, 'should find only one testMiddleware function')
    t.end()
  })

  function testMiddleware(req, res, next) {
    next()
  }
})
