const Item = require('../models/Item')
const User = require('../models/User')

// Handler methods

//@desc get all items
//@route GET /items
//@access private

const getAllItems = async (req, res) => {
    const items = await Item.find().lean()
    if (!items?.length) {
        return res.status(400).json({ message: 'No items found' })
    }
    // ascribe User DB users, to each item
    const itemsWithUser = await Promise.all(items.map(async (item) => {
        const user = await User.findById(item.user).lean().exec()
        return { ...item, username: user.username }
    }))

    res.json(itemswithUser)

}

//@desc create new item
//@route post /items
//@access private
const createNewItem = async (req, res) => {
    const { user, title, text } = req.body

    //confirm data
    if (!user || !title || !text) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    // check for duplicate items (by title)
    const duplicate = await Item.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()
    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate item already included' })
    }
    // Create and store new item on DB
    const item = await Item.create({ user, title, text })
    if (item) {
        res.status(201).json({ message: `New item ${title} created for ${user}` })
    } else {
        res.status(400).json({ message: 'Invalid item data received' })
    }
}

//@desc update item
//@route patch /items
//@access private
const updateItem = async (req, res) => {
    const { id, user, title, text, completed } = req.body

    // confirm req data all received
    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // confirm item exists on DB (by req id)
    const item = await Item.findById(id).exec()
    if (!item) {
        return res.status(400).json({ message: 'Item not found' })
    }

    // check for potentially duplicate item on DB (by title)
    const duplicate = await Item.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

    // confirm if the item found on DB is actually a duplicate (i.e. if its DB _id !== the req id)
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Not allowed. Would be working on a different item (that by chance has the same title)' })
    }

    //update item object from req.body
    item.user = user
    item.title = title
    item.text = text
    item.completed = completed

    const updatedItem = await item.save()

    res.json({ message: `${updatedItem.title} updated for ${updatedItem.user}` })

}

//@desc delete item
//@route delete /items
//@access private
const deleteItem = async (req, res) => {
    const { id } = req.body

    // confirm id received
    if (!id) {
        return res.status(400).json({ message: 'Note ID required' })
    }

    // confirm item exists on DB (by req id)
    const item = await Item.findById(id).exec()
    if (!item) {
        return res.status(400).json({ message: 'Item not found' })
    }

    const result = await item.deleteOne() //delete on DB. DB-deleted data in 'result' var (for 'reply' below)
    const reply = `Item ${item.title} with ID ${item._id} for user ${item.user} deleted`
    res.json(reply)
}

module.exports = {
    getAllItems,
    createNewItem,
    updateItem,
    deleteItem
}

