const path = require('path')

const root = path.join(__dirname, '..')
const user = require(path.join(root, 'models', 'user'))
const config = require(path.join(root, 'config', 'config'))

const validate = require('validate.js')
const _ = require('lodash')
const bcrypt = require('bcryptjs')

const service = {

  /**
   * Authenticate a user based on the credentials given.
   *
   * @param {object} credentials - User's name and password.
   * @return {Promise<number|undefined>} Authenticated user's id, undefined when unmatched
   *
   * @example
   * service.authenticate('Mark', 'password')
   */
  authenticate: async function authenticateUser(credentials) {
    const users = await service.read({
      name: credentials.name
    }, ['id', 'digest'])
    
    if(users.length !== 1) {
      return undefined
    }

    const user = users.pop()
    const matches = await bcrypt.compare(credentials.password, user.digest.toString())

    if(matches === false){
      return undefined
    }

    return user.id
  }
    
  /**
   * Create a new user.
   *
   * @param {object} info - The properties of the new user { name, password, role, phone? }
   * @return {Promise<number[]>} The added users' id
   *
   * @example
   * service.create({ name: 'Mark', password: 'password', role: 'superuser' })
   */
  , create: async function createUser(info) {
    /* TODO
     * Data validation (constraint injection)
     */

    let digest = await bcrypt.hash(info.password
                                   , config.bcrypt.hashRounds)
    
    delete info.password
    info['digest'] = digest
    return user.create(info)
  }

  /** 
   * Read (a) users' info.
   *
   * @param {object} key - The query information, {} returns all users.
   * @param {string[]} fields - Users' fields to return
   *
   * @return {Promise<object[]>} List of users matching the query
   *
   * @example
   * exports.read({ role: 'supervisor' }) - Find all supervisors
   */
  , read: async function readUser(key, fields) {
    /* TODO
     * Data validation (constraint injection)
     */

    return user.read(_.pick(key, 'id', 'name', 'role', 'phone'), fields)
  }

  /**
   * Update a users' info.
   *
   * @param {object} key - Users' identifying info.
   * @param {object} updates - Key-value pairs of the field to update and new value.
   *
   * @return {Promise<number>} - TODO
   *
   * @example
   * exports.update({ name: 'mark' }, { name:'mark shuttleworth' })
   */
  , update: async function updateUser(key, updates) {
    /* TODO
     * Data validation (constraint injection)
     */
    return user.update(key, updates)
  }

    /** 
     * Delete a user.
     *
     * @param {object} key - Users' identifying info.
     *
     * @return {Promise<number>} - TODO
     *
     * @example
     * service.delete({name: 'mark'})
     */
  , delete: async function deleteUser(key) {
    /* TODO
     * Data validation (constraint injection)
     */
    return user.delete(key)
  }
}

module.exports = service
