const functions = require('firebase-functions');
const admin = require('firebase-admin')
const math = require('mathjs')
const dateFns = require('date-fns')
const d3 = require('d3-time')
const GeoFirestore = require('geofirestore').GeoFirestore;
const GeoTransaction = require('geofirestore').GeoTransaction;

admin.initializeApp(functions.config().firebase)


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

//deploy to firebase using "firebase deploy --only functions"
const ref = admin.firestore()
const geofirestore = new GeoFirestore(ref);
hubs = geofirestore.collection('hubs')

exports.DBupdate = functions.https.onRequest((req, res) => {
    hubs.get().then(snapshot => {
        let twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
        let twoHoursAgo_ = new Date(twoHoursAgo);
        snapshot.forEach( address => {
            hubs.doc(address.id).collection('votes').get().then(query => {
                if (query.size <=0) {
                    hubs.doc(address.id).collection('upvotes_downvotes').get()
                    .then( snapshot__ => {
                        snapshot__.forEach( count => {
                            hubs.doc(address.id).collection('upvotes_downvotes').doc(count.id).delete();
                        })
                        hubs.doc(address.id).delete();
                        ref.collection('leaderboard').doc(address.id).delete();
                        return "";
                    }).catch( reason => {
                        res.send(reason);
                    })
                }
                return "";
            }).catch( reason => {
                res.send(reason);
            });
            hubs.doc(address.id).collection('votes').where('voteTime', '<', twoHoursAgo_).get()
                .then( snapshot_ => {
                    snapshot_.forEach( vote => {
                        hubs.doc(address.id).collection('votes').doc(vote.id).delete();
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

exports.updatedVoteHubs = functions.firestore.document('hubs/{address}/votes/{voterID}')
    .onWrite((change,context) => {
        console.log('updateVoteHubs')
        //value of the new vote for this location
        let newVote = null;
        let oldVote = null;
        // Updates the old vote for this location
        // should ouptut an error if it stays null. Need to learn how
        if (change.before.data() === undefined) {
            oldVote = 0;
            newVote = change.after.data().d.vote;
        } else if (change.after.data() === undefined) {
            oldVote = change.before.data().d.vote;
            newVote = 0;
        } else {
            oldVote = change.before.data().d.vote;
            newVote = change.after.data().d.vote;
        }
        //reference to the current location
        let locationRef = hubs.doc(context.params.address);
        console.log(locationRef);

        let leaderBoardRef = ref.collection('leaderboard').doc(context.params.address);
        console.log("leaderboard");

        //update count at current location based on either an update of a vote or a new vote
        return geofirestore.runTransaction(transaction => {
            const geotransaction = new GeoTransaction(transaction);
            return geotransaction.get(locationRef).then(locationDoc => {
                // console.log(locationDoc.data())
                 //compute new count
                 console.log("locationDoc", locationDoc.data())
                 let oldCount = locationDoc.data().count;
                 console.log("oldCount ", locationDoc.data().count);
                 if (oldCount === undefined) {
                     oldCount = 0;
                 }
                 let currentCount = oldCount - oldVote + newVote;
 
                 let currentTime = new Date().getTime().toString()
 
                 //compute upVotes if the new vote is an up vote
                 let upVotes_ = locationDoc.data().upVotes ? locationDoc.data().upVotes : 0;
                 let downVotes_ = locationDoc.data().downVotes ? locationDoc.data().downVotes : 0;

                 if (newVote === 1) {
                     upVotes_ += 1;
                 }

                 if (oldVote === 1) {
                     upVotes_ -= 1;
                 }
 
                 if (newVote === -1) {
                     downVotes_ += 1;
                 }

                 if (oldVote === -1) {
                     downVotes_ -= 1;
                 }

                 locationRef.collection('upvotes_downvotes').doc(currentTime).set({
                    coordinates: new admin.firestore.GeoPoint(10, 10),
                    upvotes: upVotes_,
                    downvotes: downVotes_,
                    count: currentCount
                });

                //update info in the leaderboard collection
                leaderBoardRef.set( {
                    count: currentCount,
                    state: locationDoc.data().state,
                    locality: locationDoc.data().locality !== undefined ? locationDoc.data().locality: null,
                    administrative_area_level_3: locationDoc.data().administrative_area_level_3 !== undefined ? locationDoc.data().administrative_area_level_3 : null,
                    neighborhood: locationDoc.data().neighborhood !== undefined ? locationDoc.data().neighborhood: null,
                    city: locationDoc.data().city
                });
                 //update location info
                return geotransaction.update(locationRef, {
                     count: currentCount,
                     upVotes: upVotes_,
                     downVotes: downVotes_,
                });
            });
        });
    });