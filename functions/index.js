const functions = require('firebase-functions');
const admin = require('firebase-admin')
const math = require('mathjs')
admin.initializeApp(functions.config().firebase)

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

//deploy to firebase using -firebase deploy --only functions-
const ref = admin.firestore()

exports.DBupdate = functions.https.onRequest((req, res) => {
    var stuff = [];
    ref.collection('locations').get().then(snapshot => {
        snapshot.forEach(doc => {
            var newelement = {
                "id": doc.id,
                "count": math.floor(doc.data().count-doc.data().count*0.2),
                "timeCreated": doc.data().timeCreated
            }
            stuff = stuff.concat(newelement);
            if (newelement.count > 0) {
                ref.collection('locations').doc(newelement.id).update({
                    count: newelement.count
                });
            } else {
                ref.collection('locations').doc(newelement.id).delete();
            }
        });
        res.send(stuff)
        return "";
    }).catch(reason => {
        res.send(reason)
    })
});

exports.replenishCounts = functions.https.onRequest((req, res) => {
    var stuff = [];
    ref.collection('locations').get().then(snapshot => {
        snapshot.forEach(doc => {
            var newelement = {
                "id": doc.id,
                "count": math.ceil(doc.data().count+math.floor(math.random()*100)+1),
                "timeCreated": doc.data().timeCreated
            }
            stuff = stuff.concat(newelement);
            ref.collection('locations').doc(newelement.id).update({
                count: newelement.count
            });
        });
        res.send(stuff)
        return "";
    }).catch(reason => {
        res.send(reason)
    })
});

exports.updateLocationCount = functions.firestore.document('locations/{address}/votes/{voterID}')
    .onWrite((change,context) => {
        console.log('you got here');
        if (change.type !== 'delete') {
            //value of the new vote for this location
            var newVote = change.after.data().newVote;

            //value of the last vote for this location
            var oldVote = change.after.data().oldVote;

            //reference to the current location
            var locationRef = ref.collection('locations').doc(context.params.address);

            //update count at current location based on either an update of a vote or a new vote
            return ref.runTransaction(transaction => {
                return transaction.get(locationRef).then(locationDoc => {
                    //compute new count
                    var currentCount = locationDoc.data().count - oldVote + newVote;

                    //update location info
                    return transaction.update(locationRef, {
                        count: currentCount
                    });
                });
            });
        }
        else {
            return false;
        }
    });
    