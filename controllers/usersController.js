const User = require('../models/User')
const Item = require('../models/Item')
const bcrypt = require('bcrypt')

//Handler methods

//@desc get all users
//@route GET /users
//@access private
const getAllUsers = async (req, res) => {
    const users = await User.find().select('-password').lean()

    if (!users?.length) {
        return res.status(400).json({ message: 'No users found.' })
    }
    res.json(users)
}

//@desc creat new user
//@route POST /users
//@access private
const createNewUser = async (req, res) => {
    const { username, password, roles } = req.body

    //confirm data
    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    //check for duplicate user (by username)
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    //hashing password + creating object for DB
    const hashedPwd = await bcrypt.hash(password, 10)
    const userObject = (!Array.isArray(roles) || !roles.length)
        ? { username, "password": hashedPwd }
        : { username, "password": hashedPwd, roles }

    //create and store new user on DB
    const user = await User.create(userObject)
    if (user) {
        res.status(201).json({ message: `New user ${username} created` })
    } else {
        res.status(400).json({ message: 'Invalid data for DB' })
    }
}

//@desc update a user
//@route patch /users
//@access private
const updateUser = async (req, res) => {
    const { id, username, roles, active, password } = req.body

    //confirm req data all received
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== "boolean") {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // confirm user exists on DB (by req id)
    const user = await User.findById(id).exec()
    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    //check for potentially duplicate user on DB (by req username)
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

    //confirm if the user found on DB is actually a duplicate (i.e. if its DB _id !== the req id)
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Not allowed. Would be working on a different user (that by chance has the same username)' })
        //if duplicate username but different user id = trying to work on duplicate username = error 409
    }

    //update user object from req.body
    user.username = username
    user.roles = roles
    user.active = active
    if (password) {
        //hash password (10 x salts) from req.body
        user.password = await bcrypt.hash(password, 10)
    }
    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.username} updated` })
}

//@desc delete user
//@route delete /users
//@access private
const deleteUser = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'User ID required' })
    }
    //ensure user has no items in Items model DB
    const item = await Item.findOne({ user: id }).lean().exec()
    if (item) {
        return res.status(400).json({ message: 'User has assigned items' })
    }

    const user = await User.findById(id).exec()
    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }
    //if user exists
    const result = await user.deleteOne() //delete on DB. DB-deleted data in 'result' var (for 'reply' below)
    const reply = `Username ${result.username} with ID ${result._id} deleted`
    res.json(reply)

}

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}