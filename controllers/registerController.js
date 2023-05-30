const User = require('../models/User')
const bcrypt = require('bcrypt')

//Handler methods

//@desc create new user (no choice of role)
//@route POST /register
//@access private
const registerNewUser = async (req, res) => {
    const { username, pwd } = req.body //removed roles
    //confirm data
    if (!username || !pwd) {
        return res.status(400).json({ message: '(from server) All fields are required' })
    }

    //check for duplicate user (by username)
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    //hashing password + creating object for DB
    const hashedPwd = await bcrypt.hash(pwd, 10)
    const userObject = { username, "password": hashedPwd } //removed roles

    //create and store new user on DB
    const userReg = await User.create(userObject)
    const resUsername = userReg.username
    const resPwd = userReg.hashedPwd
    const resRole = userReg.roles
    if (userReg) {
        res.status(201).json({ resUsername, resPwd, resRole })
        console.log(`user ${resUsername} successfully registered`)
    } else {
        res.status(400).json({ message: 'Invalid data for DB' })
    }
}

module.exports = {
    registerNewUser
}