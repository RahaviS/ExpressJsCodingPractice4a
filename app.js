const express = require('express')
const path = require('path')

const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null

const initializeServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is up and running on port 3000')
    })
  } catch (err) {
    console.log(`DB Error : ${err.message}`)
  }
}

initializeServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getQuery = `
    SELECT * FROM cricket_team`

  const array = await db.all(getQuery)
  response.send(array.map(each => convertDbObjectToResponseObject(each)))
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const postQuery = `INSERT INTO cricket_team(player_name,jersey_number,role)
    VALUES ('${playerName}','${jerseyNumber}','${role}')`

  const dbResponse = await db.run(postQuery)
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `SELECT * FROM 
    cricket_team WHERE Player_id = ${playerId}`

  const player = await db.get(getPlayerQuery)
  response.send(convertDbObjectToResponseObject(player))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const putQuery = `UPDATE cricket_team
    SET 
    player_name = '${playerName}',
    jersey_number = '${jerseyNumber}',
    role='${role}'
    WHERE player_id = '${playerId}'`

  const dbResponse = await db.run(putQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteQuery = `
    DELETE FROM cricket_team
    WHERE player_id =  '${playerId}'`

  const dbResponse = await db.run(deleteQuery)
  response.send('Player Removed')
})

module.exports = app
