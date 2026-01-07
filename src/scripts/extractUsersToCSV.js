require('dotenv/config')
const mongoose = require('mongoose')
const fs = require('fs')

const User = require('../models/User')

const connectToDB = async () => {
    await mongoose.connect(process.env.MONGO_DB_CONNECTION)
    console.log('Connected to DB')
}

const fetchUsers = async () => {
    return User.find()
        .select('email displayName -_id')
        .lean()
}

const buildCSV = (users) => {
    const headers = ['Email', 'FirstName']
    const rows = []

    for (let i = 0; i < users.length; i++) {
        const user = users[i]
        const email = user['email']
        const firstName = user['displayName'].split(' ')[0]
        
        if (!email || !firstName) continue
        else {
            const fields = [firstName, email]
            rows.push(fields.join(','))
        }
    }

    return [headers.join(','), ...rows].join('\n')
}

const writeCsvToFile = (csv, filename) => {
    fs.writeFileSync(filename, csv)
}

const disconnectFromDB = async () => {
    await mongoose.disconnect()
    console.log('Disconnected from DB')
}

const exportUsersToCsv = async () => {
    try {
        await connectToDB()

        const users = await fetchUsers()

        if (!users.length) {
            throw Error('Cannot build csv with 0 users')
        }

        const csv = buildCSV(users)

        writeCsvToFile(csv, 'src/scripts/users.csv')
        console.log(`Exported ${users.length} users`)
    } catch (error) {
        console.error('Export failed:', error)
    } finally {
        await disconnectFromDB()
    }
}

exportUsersToCsv()
