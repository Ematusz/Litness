const functions = require('firebase-functions');
const admin = require('firebase-admin')
const math = require('mathjs')
const dateFns = require('date-fns')
const d3 = require('d3-time')

admin.initializeApp(functions.config().firebase)

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

//deploy to firebase using "firebase deploy --only functions"
const ref = admin.firestore()

exports.DBupdate = functions.https.onRequest((req, res) => {
    ref.collection('locations').get().then(snapshot => {
        let twoHoursAgo = Date.now() - (5 * 60 * 60 * 1000);
        let twoHoursAgo_ = new Date(twoHoursAgo);
        snapshot.forEach( address => {
            ref.collection('locations').doc(address.id).collection('votes').get().then(query => {
                if (query.size <=0) {
                    ref.collection('locations').doc(address.id).collection('counts').get()
                    .then( snapshot__ => {
                        snapshot__.forEach( count => {
                            ref.collection('locations').doc(address.id).collection('counts').doc(count.id).delete();
                        })
                        ref.collection('locations').doc(address.id).delete();
                        return "";
                    }).catch( reason => {
                        res.send(reason);
                    })
                }
                return "";
            }).catch( reason => {
                res.send(reason);
            });
            ref.collection('locations').doc(address.id).collection('votes').where('voteTime', '<', twoHoursAgo_).get()
                .then( snapshot_ => {
                    snapshot_.forEach( vote => {
                        ref.collection('locations').doc(address.id).collection('votes').doc(vote.id).delete();
                    })
                    return "";
                }).catch( reason => {
                    res.send(reason);
                })
        })
        res.send("success!");
        return "";
    }).catch( reason => {
        res.send(reason);
    })
});

exports.updatedVote = functions.firestore.document('locations/{address}/votes/{voterID}')
    .onWrite((change,context) => {
        console.log('updateVote')
        //value of the new vote for this location
        let newVote = null;
        let oldVote = null;
        // Updates the old vote for this location
        // should ouptut an error if it stays null. Need to learn how
        if (change.before.data() === undefined) {
            oldVote = 0;
            newVote = change.after.data().vote;
        } else if (change.after.data() === undefined) {
            oldVote = change.before.data().vote;
            newVote = 0;
        } else {
            oldVote = change.before.data().vote;
            newVote = change.after.data().vote;
        }
        //reference to the current location
        let locationRef = ref.collection('locations').doc(context.params.address);

        //update count at current location based on either an update of a vote or a new vote
        return ref.runTransaction(transaction => {
            return transaction.get(locationRef).then(locationDoc => {
                 //compute new count
                 let oldCount = locationDoc.data().count;
                 console.log("oldCount ", locationDoc.data().count);
                 if (oldCount === undefined) {
                     oldCount = 0;
                 }
                 let currentCount = oldCount - oldVote + newVote;
 
                 let currentTime = new Date().getTime().toString()
                 ref.collection('locations').doc(context.params.address).collection('counts').doc(currentTime).set({
                     count: currentCount
                 })
 
                 //compute upVotes if the new vote is an up vote
                 let upVotes_ = locationDoc.data().upVotes;
 
                 if (upVotes_ === undefined) {
                     upVotes_ = 0;
                 }
 
                 if(newVote === 1) {
                     upVotes_ += 1;
                 }
                 if(oldVote === 1) {
                     upVotes_ -= 1;
                 }
                 //compute downVotes
                 let downVotes_ = locationDoc.data().downVotes;
 
                 if (downVotes_ === undefined) {
                     downVotes_ = 0;
                 }
 
                 if(newVote === -1) {
                     downVotes_ += 1;
                 }
                 if(oldVote === -1) {
                     downVotes_ -= 1;
                 }
                 //compute percentVotesLastThirty
 
                 //compute percentVotesLastHour
 
                 //update location info
                 return transaction.update(locationRef, {
                     count: currentCount,
                     upVotes: upVotes_,
                     downVotes: downVotes_,
                });
            });
        });
    });

    