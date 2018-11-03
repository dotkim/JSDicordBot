const dotenv = require('dotenv').config();
const { Pool, Client } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
})


exports.getTemplateChannel = function () {
  return new Promise((result, reject) => {
    pool.query('SELECT "channelID" FROM keys.channels WHERE "channelName" = \'templatechannel\'', (err, res) => {
      if (err) {
        reject(err)
      }
      else {
        result(res.rows[0].channelID);
      }
    })
  })
}

exports.getInfoChannel = function () {
  return new Promise((result, reject) => {
    pool.query('SELECT "channelID" FROM keys.channels WHERE "channelName" = \'infochannel\'', (err, res) => {
      if (err) {
        reject(err)
      }
      else {
        result(res.rows[0].channelID);
      }
    })
  })
}

exports.getMessage = function (channelID, desc) {
  return new Promise((result, reject) => {
    qry = 'SELECT "messageID" FROM keys.messages WHERE "channelID" = \'' + channelID + '\' AND "messageDescription" = \'' + desc + '\''
    pool.query(qry, (err, res) => {
      if (err) {
        reject("test " + err)
      }
      else {
        if (res.rowCount == 0) {
          result("")
        }
        else {
          result(res.rows[0].messageID);
        }
      }
    })
  })
}

exports.setMessage = function (messageID, desc, channelID) {
  return new Promise((result, reject) => {
    qry = 'INSERT INTO keys.messages VALUES (' + messageID + ', \'' + desc + '\', ' + channelID + ')'
    pool.query(qry, (err, res) => {
      if (err) {
        reject("test " + err)
      }
      else {
        result(res);
      }
    })
  })
}