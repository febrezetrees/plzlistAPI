const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//Handler methods

//@desc login
//@route POST /auth
//@access Public
const login = async (req, res) => {
    const { username, password } = req.body //inputs have to line up exactly with these names

    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required - either missing a username or password' })
    }

    const foundUser = await User.findOne({ username }).exec()

    if (!foundUser || !foundUser.active) {
        return res.status(401).json({ message: 'Unauthorised yo - no matching User or active User' })
    }

    const match = await bcrypt.compare(password, foundUser.password) //password = plain-text password / foundUser.password = encrypted password

    if (!match) return res.status(401).json({ message: 'Unauthorised yo. No matching password' })

    //create accessToken
    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '10s' } //test time: 10s for dev. 15m for production
    )

    //create refreshToken (jwt)
    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' } //test time: 20s for dev. 7d for production
    )

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week expiry
    })

    res.json({ accessToken })
}

//@desc refresh
//@route GET /auth/refresh
//@access Public
const refresh = (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorised. No refreshToken titled 'jwt' in req cookie received" })

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden. Jwt not verified.' })

            const foundUser = await User.findOne({ username: decoded.username })

            if (!foundUser) return res.status(401).json({ message: 'Unauthorised. No User found in DB' })

            const accessToken = jwt.sign( //new accessToken
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "roles": foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            )

            res.json({ accessToken })

        }
    )
}

//@ desc logout
//@ route POST /auth/logout
//@ access Public

const logout = (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204)
    res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None' })
    res.json({ message: 'Cookie cleared' })

}

module.exports = {
    login,
    refresh,
    logout
}