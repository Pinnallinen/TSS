const path = require('path')
const root = path.join(__dirname, '..')
const services = require(path.join(root, 'services'))
const validators = require(path.join(root, 'validators'))

exports.hasProperty = function userHasProperty(propertyName, value, equalityFn) {
  function propertyEquals(obj) {
    return equalityFn === undefined
      ? obj[propertyName] === value
      : equalityFn(obj[propertyName], value)
  }

  return function(request, response, next) {
    if(propertyEquals(response.locals.user)) {
      return next()
    }
    return response.status(403).send({
      error: 'User doesn\'t have privileges to this resource'
    })
  }
}

const serviceCalls = {
  sign: async function signUser(request, response, next) {
    const credentials = response.locals.credentials
    try {
      response.locals.id = await services.user.authenticate(credentials)
    }
    catch(e) {
      /*
       * Something went wrong in the database call, possibly user doesn't
       * exist, password was incorrect, or some connection error
       */

      // handle known errors unknown user and incorrect password with a
      // response
      if(e.name === 'Unknown user' || e.name === 'Incorrect password') {
        return response
          .set('WWW-Authenticate', 'Basic')
          .status(401)
          .send({
            error: e.message
          })
      }
      else {
        // Rest should be moved to an error handler (respond with 500?)
        return next(e)
      }
    }
    return next()
  }
  , readFilter: async function readFilterUser(request, response, next) {
    const query = response.locals.query
    try {
      response.locals.queryResult = await services.user.read(query, [])
    }
    catch(e) {
      // Connection and other unexpected errors
      return next(e)
    }
    return next()
  }
  , read: async function readUser(request, response, next) {
    const query = response.locals.query
    try {
      response.locals.queryResult = await services.user.read(query, [])
    }
    catch(e) {
      return next(e)
    }
    return next()
  }
  , create: async function createUser(request, response, next) {
    const query = response.locals.query
    let id
    try {
      id = await services.user.create(query)
    }
    catch(e) {
      return next(e)
    }

    try {
      response.locals.queryResult = await services.user.read({id: id})
    }
    catch(e) {
      return next(e)
    }
    response.locals.address = `/api/user/${id}`
    return next()
  }
  , update: async function updateUser(request, response, next) {
    const id = response.locals.id
    const updates = response.locals.updates

    try {
      response.locals.queryResult = await services.user.update(id, updates)
    } catch(e) {
      return next(e)
    }
    return next()
  }
  , delete: async function deleteUser(request, response, next) {
    const query = response.locals.query
    try {
      response.locals.queryResult = await services.user.delete(query)
    } catch(e) {
      return next(e)
    }
    return next()
  }
}

exports.sign = [
  validators.user.sign
  , serviceCalls.sign
]

exports.readFilter = [
  validators.user.readFilter
  , serviceCalls.readFilter
]

exports.read = [
  validators.user.read
  , serviceCalls.read
]

exports.create = [
  validators.user.create
  , serviceCalls.create
]

exports.update = [
  validators.user.update
  , serviceCalls.update
]

exports.delete = [
  validators.user.delete
  , serviceCalls.delete
]
