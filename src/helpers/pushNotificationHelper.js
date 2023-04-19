const FCM = require('fcm-node')

var serverKey = require('../../mvem-51da7-firebase-adminsdk-cltq9-089b69bd83.json')
module.exports = (req, res, next) => {
    var fcm = new FCM(serverKey)
    return fcm;
  };
  