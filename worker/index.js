const config = require('./config.json')
const uuidv1 = require('uuid/v1')
const extend = require('util')._extend
const cxnOptions = config.cxnOptions
if (process.env.rdbHost !== undefined && process.env.rdbHost !== '') {
  cxnOptions.host = process.env.rdbHost
}
if (process.env.rdbPort !== undefined && process.env.rdbPort !== '') {
  cxnOptions.port = process.env.rdbPort
}
const rethink = require('rethinkdbdash')(cxnOptions)
const rfqQueue = require('rethinkdb-job-queue')
let rpRequest = require('request-promise')
let ESuserData = null
var elasticsearch = require('elasticsearch')

let ESConnection = extend({}, config.ESConnection)
if (process.env.esHost !== undefined && process.env.esHost !== '') {
  ESConnection.host = process.env.esHost
}
if (process.env.esPort !== undefined && process.env.esPort !== '') {
  ESConnection.port = process.env.esPort
}
if (process.env.esAuth !== undefined && process.env.esAuth !== '') {
  ESConnection.auth = process.env.esAuth
}
let password
let optionsES = {
  tls: 'https://',
  host: ESConnection.host,
  path: '_xpack/security/user/',
  port: ESConnection.port,
  auth: ESConnection.auth
}

let esUrl = 'https://' + ESConnection.auth + '@' + ESConnection.host + ':' + ESConnection.port

let esClient = new elasticsearch.Client({
  host: esUrl
})

let queueOption = {
  name: 'importData'
}

const objQ = new rfqQueue(cxnOptions, queueOption)

function getJobQueue () {
  objQ.process((job, next) => {
    // Get all suppliers approve data.
    rethink.table(cxnOptions.vshopDetail)
    .filter({id: job.data.vId})
    .run().then(function (result) {
      doJob(job, result[0], next)
    })
  })
}

async function doJob (objWorkJob, result, next) {

    if (!objWorkJob.data) {
      next({error: 'Job Data not available'})
    }
    let userData = await getUserRequestResponse(objWorkJob).catch(err => {
      console.log('User Error..', err)
      next(err)
    })
    var getUserNextVersion1
    try {
      getUserNextVersion1 = await getUserNewVersion(ESuserData[objWorkJob.data.vId])
    }
    catch(err) {
      console.log('Vshop Data Error...', err)
      next(err)
    }
    let esUpdateArr = []
    for (let i = 0; i < result.suppliers.length; i++) {
      let supplyerName = result.suppliers[i].supplyerName
      let selectedProducts = result.suppliers[i].products
      for(var productKey in selectedProducts) {
        let productId = Object.keys(selectedProducts[productKey])[0]
        esUpdateArr.push({
          "update": {
            "_index": 'pdm1',
            "_type": 'product',
            "_id": productId
          }
        },
        {
          "script": {
            "inline": "ctx._source.vid.add(params.newVid)",
            "params" : {
              "newVid" : getUserNextVersion1
            },
            "lang" : "painless"
          }
        })
      }
    }
    if(esUpdateArr.length > 0) {
      let dumpEsResponse = await dumpToES(esUpdateArr)
      let updateRdbResponse = await updateInRdb(objWorkJob, userData)
      let vid = Object.keys(userData)
      if(updateRdbResponse) {
        console.log('VID ', vid[0], 'Generated Successfully..!')
        console.log('Email : ', userData[vid[0]].email, 'Username : ', userData[vid[0]].username)
        next(null, 'sucessfull')
      } else {
        console.log('Unsucessfull..!')
        next('unsucessfull')
      }
    }
}

async function updateInRdb (objWorkJob, userData) {
  return rethink.table(cxnOptions.vshopData)
    .filter({'id': objWorkJob.data.vId})
    .update({
      'esUser': userData[objWorkJob.data.vId].username === undefined ? objWorkJob.data.vId : userData[objWorkJob.data.vId].username,
      'password': password,
      'status': 'completed'
    })
    .run()
}

async function dumpToES (makeProductJsonObj) {
  let bulkRowsString = makeProductJsonObj.map(function (row) {
    return JSON.stringify(row)
  }).join('\n') + '\n'
  return new Promise(function (resolve) {
    esClient.bulk({body: makeProductJsonObj}, function (err, resp) {
      if (!err) {
        resolve('Inserted')
      } else {
        console.log('Error : ', err)
      }
    })
  })
}

function getUserNewVersion (ESUser) {
  let versionNo = 1
  if (ESUser.metadata.user_version_history) {
    versionNo = ESUser.metadata.user_version_history.length + 1
  }
  return 'dist' + ESUser.username + '-' + versionNo
}

// Unused Function
async function getEsSku(supplyerName,sku){
  let body = {
    "_source":["_id"],
    "query": {
      "bool": {
        "must": [
          { "match": { "supplier_info.username":supplyerName }},
          { "match": { "country": "US" }},
          { "terms": { "sku.raw": sku }}
        ]
      }
    }
  }
  let response = await esClient.search({
    index:  'pdm1',
    type:  'product',
    body: body
  })
  return response
}

async function getUserRequestResponse (objWorkJob) {
  let jobData = objWorkJob.data
  let emailId = jobData.userdetail.emailId
  let vId = jobData.vId
  let userData = await getESUser(vId)
  if (userData && Object.keys(userData).length > 0) {
    // User Exists
    ESuserData = JSON.parse(userData)
    return ESuserData
  } else {
    // make new user with version
    let userData = await makeNewUser(objWorkJob)
    return userData
  }
}

async function getESUser (vId) {
  // make http request for user exist or not
  return await makeHttpSRequest(vId)
}

async function makeHttpSRequest (vId) {
  let objOptions = optionsES
  return new Promise(function(resolve, reject) {
      rpRequest(objOptions.tls + objOptions.auth + '@' + objOptions.host + ':' + objOptions.port + '/' + objOptions.path + vId)
      .then(function(response) {
        resolve(response)
      })
      .catch(function(error) {
        let obj = {}
        resolve(obj)
      })
  })
}

async function makeNewUser (objWorkJob) {
  let jobData = objWorkJob.data
  let emailId = jobData.userdetail.emailId
  let username = jobData.userdetail.username
  let vId = jobData.vId
  password = uuidv1();

  let userObject = {
    'username': vId,
    'password': password,
    'roles': ['read'],
    'full_name': username,
    'email': emailId,
    'metadata': {
      'company': '',
      'sid': "dist"+vId+"-1"
    },
    'enabled': true
  }

  await makeHttpsPostRequest(vId, userObject)

  let userData = await getESUser(vId)
  if (userData && Object.keys(userData).length > 0) {
    // User Exists
    ESuserData = JSON.parse(userData)
    return ESuserData
  }
}

async function makeHttpsPostRequest (username, userData) {
  let objOptions = optionsES
  let reqOptions = {
    method: 'POST',
    uri: objOptions.tls + objOptions.auth + '@' + objOptions.host + ':' + objOptions.port + '/' + objOptions.path + username,
    body: userData,
    json: true
  }

  let response = await rpRequest(reqOptions)
  return response
}

getJobQueue()
