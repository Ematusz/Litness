import React from 'react';
import { TouchableOpacity,FlatList,Animated, Text, View, Button, Image } from 'react-native';
import SideTab from './SideTab.js';
import InfoPage from './InfoPage.js';
import Leaderboard from './Leaderboard.js';
import LeaderboardTab from './LeaderboardTab.js';
import Map from './Map.js';
import {Constants, Location, Permissions} from 'expo';
import g from 'ngeohash'
import * as math from 'mathjs';
import * as firebase from 'firebase';
import 'firebase/firestore';
import styles from './styles.js';
import * as d3 from 'd3-time';

let id = 0;

function getRandomInt(min,max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max-min))+min;
}

const AnimatedSideTab = Animated.createAnimatedComponent(SideTab);
const AnimatedInfoPage = Animated.createAnimatedComponent(InfoPage);
const AnimatedLeaderboard = Animated.createAnimatedComponent(Leaderboard);
const AnimatedLeaderboardTab = Animated.createAnimatedComponent(LeaderboardTab);

export default class MasterView extends React.Component {

    constructor(props) {
      super(props);
      this.state = { 
        pressStatus: false,
        showStatus: false,
        infoPage: false,
        leaderBoard: false,
        tabVal: false,
        animatedFlex: new Animated.Value(.5),
        animatedHeight: new Animated.Value(30),
        animatedTop: new Animated.Value(1000),
        animatedLeaderboard: new Animated.Value(1000),
        animatedLeaderboardButton: new Animated.Value(-3),
        animatedTab:  new Animated.Value(500),
        locationResult:null,
        testtest:null,
        geoHashGrid: {},
        markers_: {},
        leaderBoard_: [],
        data_: [],
        showVotingButtons: true,
        selectedMarker:null,
        selectedGeohash:null,
        markerBorderColor: "transparent",
        infoPageMarker:null,
        infoPageGeohash:null,
        ghostMarker: [],
        mapRegion: {
          latitude: null,
          latitudeDelta: null,
          longitude: null,
          longitudeDelta: null
        },
        currentGrid: [],
        userLocation: {
          formattedAddress: null,
          latitude: null,
          longitude: null
        },
        error: null,
        testString: null,
      };
  
      this.showVotingButtonsHandler = this.showVotingButtonsHandler.bind(this)
      this.selectedGeohashHandler= this.selectedGeohashHandler.bind(this);
      this.selectedMarkerHandler= this.selectedMarkerHandler.bind(this);
      this.onLongPressHandler = this.onLongPressHandler.bind(this);
      this.tabValHandler = this.tabValHandler.bind(this);
      this.mapRegionHandler = this.mapRegionHandler.bind(this);
      this.currentGridHandler = this.currentGridHandler.bind(this);
      this.ghostMarkerHandler = this.ghostMarkerHandler.bind(this);
      this.geoHashGridHandler = this.geoHashGridHandler.bind(this);

      this._addListener = this._addListener.bind(this);
      this.componentDidMount = this.componentDidMount.bind(this);
      this.closePopUp = this.closePopUp.bind(this);
      this.changeLit = this.changeLit.bind(this);
      this.toggleInfoPage = this.toggleInfoPage.bind(this);
      this.toggleLeaderBoard = this.toggleLeaderBoard.bind(this);
      this.toggleTab = this.toggleTab.bind(this);
      this.hideTab = this.hideTab.bind(this);
      this.returnUpVotes = this.returnUpVotes.bind(this);
      this.returnDownVotes = this.returnDownVotes.bind(this);
      this.renderImage = this.renderImage.bind(this);
    }
  
    componentDidMount() {
      // updates the userLocation prop when the user moves a significant amount
      this.watchID = navigator.geolocation.watchPosition(
        position => {
          const { latitude, longitude } = position.coords;
  
          // Fetch curent location
          myApiKey = 'AIzaSyBkwazID1O1ryFhdC6mgSR4hJY2-GdVPmE';
          fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + latitude + ',' + longitude + '&key=' + myApiKey)
          .then((response) => response.json())
          .then((responseJson) => {
            var results = JSON.parse(JSON.stringify(responseJson)).results
            var len = results.length
            var i = 0;
            var minDist = -1;
            var userAddressDictionary = {}
            // creates a dictionary of all possible locations returned by the fetch
            for (indx = 0; indx < len; indx++) {
              if (!isNaN(parseInt(results[indx].formatted_address[0]))) {
                userAddressDictionary[results[indx].formatted_address] = true;
              }
              // var dist = math.sqrt(math.square(latitude-results[indx].geometry.location.lat)+math.square(longitude-results[indx].geometry.location.lng));
              // if (minDist == -1) {
              //   minDist = dist;
              // }
              // else if (dist < minDist) {
              //   minDist = dist;
              //   i = indx;
              // }
            }
            var finalResult = results[i]
            // var userAddress = finalResult.formatted_address;
            len = finalResult.address_components.length;
            var userCity = null;
            var l = null;
            for (j = 0; j < len; j++) {
              l = finalResult.address_components[j].types.length;
              for (k = 0; k < l; k++) {
                if (finalResult.address_components[j].types[k] == "locality") {
                  userCity = finalResult.address_components[j].long_name;
                }
              }
            }
            // saves address, latitude, and longitude in a coordinate object
            const newCoordinate = {
              userCity,
              // userAddress,
              userAddressDictionary,
              latitude,
              longitude
            };
            console.log("coordinate ", newCoordinate);
            // sets new userLocation based on previously created coordinate object
            this.setState({userLocation: newCoordinate});
          })
        }
      )
  }
    componentWillMount() {
      this._getDeviceInfoAsync();
    }


    _addListener = async() => {
      listener = db.collection('locations')
      .where("geohash", "array-contains", await this.state.currentGrid[0])
      .onSnapshot(snapshot => {
        let changes = snapshot.docChanges();
        changes.forEach(change => {
          // Create a new location and add it to the markers dictionary when a new document is added to the listener.
          if(change.type == 'added'){
            let newGrid = {...this.state.geoHashGrid};
            if (change.doc.data().geohash[0] in newGrid) {
              let newDictionary = {...newGrid[change.doc.data().geohash[0]]}
              newDictionary[change.doc.id] = {
                  coordinate: {
                    latitude: change.doc.data().latitude,
                    longitude: change.doc.data().longitude
                  },
                  cost: change.doc.data().count,
                  address: change.doc.id,
                  geohash: change.doc.data().geohash[0],
                  upVotes: change.doc.data().upVotes,
                  downVotes: change.doc.data().downVotes,
                  borderColor: "transparent",
                  key: change.doc.id,
              }
              newGrid[change.doc.data().geohash[0]] = newDictionary
              this.setState({geoHashGrid: newGrid})
            } else {
              let newDictionary = {};
              newDictionary[change.doc.id] = {
                  coordinate: {
                    latitude: change.doc.data().latitude,
                    longitude: change.doc.data().longitude
                  },
                  cost: change.doc.data().count,
                  address: change.doc.id,
                  geohash: change.doc.data().geohash[0],
                  upVotes: change.doc.data().upVotes,
                  downVotes: change.doc.data().downVotes,
                  borderColor: "transparent",
                  key: change.doc.id,
              }
              newGrid[change.doc.data().geohash[0]] = newDictionary
              this.setState({geoHashGrid: newGrid})
            }
          } 
          // update the data in the markers dictionary if a document in the listener has been modified.
          else if(change.type == 'modified'){
            let newGrid = {...this.state.geoHashGrid};
            // this if statement may be redundant
            let newDictionary = newGrid[change.doc.data().geohash[0]];
            newDictionary[change.doc.id].cost = change.doc.data().count;
            newDictionary[change.doc.id].upVotes = change.doc.data().upVotes;
            newDictionary[change.doc.id].downVotes = change.doc.data().downVotes;
            newGrid[change.doc.data().geohash[0]] = newDictionary;
            this.setState({geoHashGrid: newGrid});
          }
          // if a document in the listener has been removed it will delete the location from
          // the markers_ dictionary
          else if(change.type == 'removed') {
            let newGrid = {...this.state.geoHashGrid};
            // this if statement may be redundant
            let newDictionary = newGrid[change.doc.data().geohash[0]];
            delete newDictionary[change.doc.id];
            newGrid[change.doc.data().geohash[0]] = newDictionary;
            this.setState({geoHashGrid: newGrid})
          }
        })
      })
    }
  
    // this gets the Id for the phone. TODO: update to device ID after ejecting project
    // installationID will likely only work for expo
    _getDeviceInfoAsync = async() => {
      console.log('retrieving info')
      var uniqueId = Constants.installationId;
      console.log(uniqueId);
    }

    showVotingButtonsHandler(someValue) {
        console.log("I made it to showVotingButtonsHandler");
        this.setState({
            showVotingButtons: someValue
        })
    }

    selectedGeohashHandler(someValue) {
      console.log("I made it to selectedGeohashHandler");
        this.setState({
            selectedGeohash: someValue
        })
    }

    selectedMarkerHandler(someValue) {
      console.log("I made it to selectedMarkerHandler");
        this.setState({
            selectedMarker: someValue
        })
    }

    onLongPressHandler(someValue) {
      console.log("I made it to onLongPressHandler");
        this.setState({
            onLongPress: someValue
        })
    }

    ghostMarkerHandler(someValue) {
      console.log("I made it to ghostMarkerHandler");
        this.setState({
          ghostMarker: someValue
        })
    }

    tabValHandler() {
      console.log("I made it to tabValHandler");
    Animated.timing(this.state.animatedTab, {
        toValue: 370,
        friction: 100,
        duration: 200
        }).start();
        this.setState(previousState => (
            { tabVal: !previousState.tabVal}
        ))
    }

    mapRegionHandler(someValue) {
      console.log("I made it to mapRegionHandler");
      this.setState({
        mapRegion: someValue
      })
    }

    currentGridHandler(someValue) {
      this.setState({
        currentGrid: someValue
      },
      this._addListener)
    }

    geoHashGridHandler(someValue) {
      this.setState({
        geoHashGrid: someValue
      })
    }
  
    // Toggles the info page on a hub
    toggleInfoPage (markerAddress) {
      // if infoPage is currently listed as false, open the page. Otherwise close it.
      if (!this.state.infoPage) {
        let data = [];
        let total = 0;
        let minute = null;
        let time = null;
        let currentTime = new Date();
        db.collection('locations').doc(markerAddress).collection('votes').orderBy('voteTime')
          .get().then( snapshot => {
            snapshot.forEach( doc => {
              total = total + doc.data().vote;
              time = d3.timeMinute(doc.data().voteTime.toDate());
              if (minute == null) {
                minute = time;
                vote = {value: total, time: minute};
                data.push(vote);
              } else if (minute.getTime() == time.getTime()) {
                data[data.length-1].value = total;
              } else {
                minute = time;
                vote = {value: total, time: minute};
                data.push(vote);
              }
            })
            if (minute != d3.timeMinute(currentTime)) {
              vote = {value: total, time: d3.timeMinute(currentTime)};
              data.push(vote);
            }
            
            this.setState({data_: data},()=>{
              Animated.spring(this.state.animatedTop, {
              toValue: 50,
              friction: 100,
              duration: 300,
            }).start();

            Animated.spring(this.state.animatedLeaderboardButton, {
              toValue: -50,
              friction: 100,
              duration: 300
            }).start();
          
          });
          })
  
      } else {
        let emptyData = [];
        this.setState({data_: emptyData})
        Animated.spring(this.state.animatedTop, {
          toValue: 1000,
          friction: 100,
          duration: 200
        }).start();
  
        Animated.spring(this.state.animatedLeaderboardButton, {
          toValue: -3,
          friction: 100,
          duration: 200
        }).start();
      }
      // closes the vote tab when the info page is up so that its not distracting.
      if (this.state.infoPage) {
        this.toggleTab(this.state.infoPageMarker,this.state.selectedGeohash);
        this.setState({infoPageMarker: null});
        this.setState({infoPageGeohash: null});
      }
      // re opens the tab when the info page closes
      else {
        this.setState({infoPageMarker: this.state.selectedMarker});
        this.setState({infoPageGeohash: this.state.selectedGeohash});
        this.hideTab();
      }
      // switches the infoPage state to on or off
      this.setState(previousState => (
        { infoPage: !previousState.infoPage }
      ))
    }
  
    toggleLeaderBoard() {
      if (!this.state.leaderBoard) {
        var leaderBoard_ = [];
        db.collection('locations').where("city", "==", this.state.userLocation.userCity).orderBy('count', 'desc').limit(25).get()
          .then( snapshot => {
            let counter = 1;
            snapshot.forEach( doc => {
              leaderBoard_.push({
                number: doc.data().number,
                street: doc.data().street,
                count: doc.data().count,
                key: counter.toString()   
              });
              counter = counter + 1;
            })
  
          this.setState({leaderBoard_});
          }).catch( error =>{
            console.log(error)
          })
          
        console.log(this.state.leaderBoard_);
        Animated.timing(this.state.animatedLeaderboard, {
          toValue: 50,
          friction: 100,
          duration: 300
        }).start();
  
        Animated.timing(this.state.animatedLeaderboardButton, {
          toValue: -50,
          friction: 100,
          duration: 300
        }).start();
  
        if (this.state.tabVal) {
          Animated.timing(this.state.animatedTab, {
            toValue: 1000,
            friction: 100,
            duration: 200
          }).start();
        }
  
      } else {
  
        Animated.timing(this.state.animatedLeaderboard, {
          toValue: 1000,
          friction: 100,
          duration: 200
        }).start();
  
        Animated.timing(this.state.animatedLeaderboardButton, {
          toValue: -3,
          friction: 100,
          duration: 200
        }).start();
  
        if (this.state.tabVal) {
          Animated.timing(this.state.animatedTab, {
            toValue: 370,
            friction: 100,
            duration: 200
          }).start();
        }
      }
      // switches the infoPage state to on or off
      this.setState(previousState => (
        { leaderBoard: !previousState.leaderBoard }
      ))
    }
  
    toggleTab(markerAddress,geohash) {
      // Checks to see if the marker is in the array of active markers. This is a trigger
      // to see if youre working with a ghost marker. If the marker is a ghost marker
      // and you click it again, it will just hide the tab without adding a new marker 
      // the array.
      if(this.state.geoHashGrid[geohash] === undefined || !Object.keys(this.state.geoHashGrid[geohash]).includes(markerAddress)) {
        this.hideTab();
      }
      // checks to see if the marker you clicked on is the one currently stored as
      // selectedMarker. If not, this should change the selected address to the one
      // youre clickig on now.
      else if(this.state.selectedMarker !== markerAddress) {
  
        if(markerAddress in this.state.userLocation.userAddressDictionary) {
          console.log("YES")
          this.setState({showVotingButtons: true})
        } else {
          console.log("NO")
          this.setState({showVotingButtons: true})
        }
  
        if (!this.state.tabVal) {
          Animated.timing(this.state.animatedTab, {
            toValue: 370,
            friction: 100,
            duration: 200
          }).start();
          this.setState(previousState => (
            { tabVal: !previousState.tabVal 
            }
          ))
        }
        this.setState({selectedGeohash: geohash});
        this.setState({selectedMarker: markerAddress});
  
        if (this.state.geoHashGrid[geohash][this.state.selectedMarker]) {
          this.state.geoHashGrid[geohash][this.state.selectedMarker].borderColor = "transparent"
        }
        this.state.geoHashGrid[geohash][markerAddress].borderColor = "#e8b923"
  
        console.log(this.state.geoHashGrid[geohash][this.state.selectedMarker])
        console.log(this.state.selectedMarker);
        console.log(markerAddress)
        // if (this.state.geoHashGrid[geohash][this.state.selectedMarker]) {
        //   this.state.geoHashGrid[geohash][this.state.selectedMarker].borderColor = "#e8b923"
        // }
  
        this.setState({onLongPress: false});
      } 
      // if the marker you're clicking on is neither a ghost marker, nor a new marker, it must
      // be the same one so we just close it.
      else{
        this.state.geoHashGrid[geohash][markerAddress].borderColor = "transparent"
        this.hideTab();
      }
      
      
    }
  
    // hides the voting tab and switches the state back to false. Also clears out ghostMarker
    // if necessary.
    hideTab() {
      if (this.state.tabVal) {
        Animated.timing(this.state.animatedTab, {
          toValue: 1000,
          friction: 200,
          duration: 500
        }).start();
        this.setState(previousState => (
          { tabVal: !previousState.tabVal }
        ))
      }
      
      if (this.state.geoHashGrid[this.state.selectedGeohash] != undefined) {
        if (this.state.geoHashGrid[this.state.selectedGeohash][this.state.selectedMarker] != undefined) {
          this.state.geoHashGrid[this.state.selectedGeohash][this.state.selectedMarker].borderColor = "transparent"
        }
      }
      
      this.setState({selectedMarker: null});
      var deleteGhost = []
      this.setState({ghostMarker: deleteGhost});
    }
  
    closePopUp() {
      if (this.state.showStatus) {
        Animated.timing(this.state.animatedHeight, {
          toValue: 0,
          duration: 100
        }).start();
      }
    }
  
    //UPDATED THIS TO WORK WITH DATABASE
    // Adds one vote for lit at the current marker.
    changeLit(address,geohash,vote) {
      // recieve the ID from the user
      // var uniqueId = Constants.installationId;
      console.log("HelloWorld")
      var uniqueId = Math.random().toString();
      // collect timestamp.
      var time = new Date();
      
      // TODO: if the marker is not in the markers_ array, then it means that either the address
      // of the marker is not currently in the database, or somehow, the address is in the
      // database but was not loaded into the local dictionary of markers. This is something
      // that I am only now considering and should fix. Although if it were in the database
      // and you can click on it, it should be in the markers database. This is supposed to
      // be used to turn a ghost marker into a regular marker. 
      if (this.state.geoHashGrid[geohash] == undefined || !Object.keys(this.state.geoHashGrid[geohash]).includes(address)){
        var latitude = this.state.ghostMarker[0].coordinate.latitude;
        var longitude = this.state.ghostMarker[0].coordinate.longitude;
        var city = this.state.ghostMarker[0].city;
        var street = this.state.ghostMarker[0].street;
        var number = this.state.ghostMarker[0].number;
        hashes = [g.encode_int(latitude,longitude,26)];
        hashNeighbors = g.neighbors_int(hashes[0],26);
        // get a reference to the document at this address in the database.
        var ref = db.collection('locations').doc(address);
        ref.get()
          .then( doc => {
            // if the document doesnt yet exist, add a new one with base stats.
            if (!doc.exists) {
              ref.set({
                count: 0,
                upVotes: 0,
                downVotes: 0,
                percentVotesLastThirty: 0,
                percentVotesLastHour: 0,
                timeCreated: time,
                latitude:  latitude,
                longitude: longitude,
                geohash: hashes.concat(hashNeighbors),
                imagePath: './assets/logs.png',
                city: city,
                street: street,
                number: number
              })
              // add a new vote to the votes on this document with the users uniqueID.
              ref.collection('votes').doc(uniqueId).set({
                voteTime: time,
                vote: vote,
              })
            }
          })
          // assuming it was a ghost marker, that marker can now be hidden.
          this.hideTab(); 
  
      // if the marker is in the markers vector then it is already in the database and
      // we just need to update the votes.
      } else {
        // gets a reference to the document at the address.
        var ref = db.collection('locations').doc(address).collection('votes').doc(uniqueId);
        return ref.get()
        .then( voteDoc => {
          // if there is a document at this address in the votes collection with the users
          // unique ID then they can only update their vote
          if (voteDoc.exists) {
            // if the user had not previously up voted this location then change their vote to
            // an upVote.
            if (voteDoc.data().vote != vote) {
              var newVote = vote;
              ref.set({
                voteTime: time,
                vote: newVote,
              })
            }
          }
          // if there is not yet a vote with uniqueID, then the user has not yet voted on this
          // hub. Therefore, we must add a new upVote with their uniqueID as the key
          else {
            db.collection('locations').doc(address).collection('votes').doc(uniqueId).set({
              voteTime: time,
              vote: vote,
            })
          }
        })
      }
    
    }
  
    // This is being used to get upVotes for the info page, this is because some of this
    // does not have a default value so it needs a function to call it.
    returnUpVotes(address,geohash) {
      if (this.state.geoHashGrid[geohash] != null) {
        if (this.state.geoHashGrid[geohash][address] != null) {
          return this.state.geoHashGrid[geohash][address].upVotes;
        } else {
          return null;
        }
      } else {
        return null
      }
    }
  
    // see returnUpVotes but this works for downVotes
    returnDownVotes(address,geohash) {
      if (this.state.geoHashGrid[geohash] != null) {
        if (this.state.geoHashGrid[geohash][address] != null) {
          return this.state.geoHashGrid[geohash][address].downVotes;
        } else {
          return null;
        }
      } else {
        return null
      }
    }
  
    // see return upVotes but this is for timeCreated
    returnTimeCreated(address, geohash) {
      if (this.state.geoHashGrid[geohash] != null) {
        if (this.state.geoHashGrid[geohash][address] != null) {
          return this.state.geoHashGrid[geohash][address].timeCreated;
        } else {
          return null;
        }
      } else {
        return null
      }
    }
  
    renderImage(markerCost){
      if (markerCost < 0) {
        return <Image
        style = {styles.emojiIcon}
        source={require('./assets/poop.png')}
      />;
      } else if(markerCost < 10) {
         return <Image
         style = {styles.emojiIcon}
         source={require('./assets/logs.png')}
       />;
      } else if (markerCost < 50) {
        return <Image
         style = {styles.emojiIcon}
         source={require('./assets/fire.png')}
       />;
      } else if (markerCost < 100) {
        return <Image
         style = {{...styles.emojiIcon,borderColor:'crimson'}}
         source={require('./assets/fire.png')}
       />;
      } else {
        return <Image
         style = {{...styles.emojiIcon,borderColor:'dodgerblue'}}
         source={require('./assets/fire.png')}
       />;
      } 
   }

    // renders the onscreen info
    render() {
      return (
        <View style = {styles.bigContainer}>        
  
            <Map geoHashGrid={this.state.geoHashGrid}
                 hideTab = {this.hideTab} 
                 onLongPressHandler={this.onLongPressHandler}
                 selectedMarker={this.state.selectedMarker} 
                 selectedMarkerHandler={this.selectedMarkerHandler}
                 selectedGeohashHandler={this.selectedGeohashHandler} 
                 tabValHandler={this.tabValHandler}
                 showVotingButtonsHandler={this.showVotingButtonsHandler} 
                 ghostMarker={this.state.ghostMarker}
                 mapRegionHandler={this.mapRegionHandler} 
                 currentGridHandler={this.currentGridHandler}
                 userLocation={this.state.userLocation} 
                 ghostMarkerHandler={this.ghostMarkerHandler} 
                 geoHashGridHandler={this.geoHashGridHandler} 
                 toggleTab={this.toggleTab} 
                 renderImage={this.renderImage}
            />
  
            <AnimatedInfoPage style = {{top:this.state.animatedTop}}
                              toggleInfoPage={this.toggleInfoPage}
                              infoPageMarker={this.state.infoPageMarker}
                              data_={this.state.data_}
                              returnUpVotes={this.returnUpVotes(this.state.infoPageMarker,this.state.infoPageGeohash)}
                              returnDownVotes={this.returnDownVotes(this.state.infoPageMarker,this.state.infoPageGeohash)}
            />
  
            <AnimatedSideTab style = {{left:this.state.animatedTab}} 
                             clickInfo = {()=>this.toggleInfoPage(this.state.selectedMarker)} 
                             clickFire={()=>this.changeLit(this.state.selectedMarker,this.state.selectedGeohash,1)}
                            //  clickShit={()=>this.deleteLit(this.state.selectedMarker,this.state.selectedGeohash)}
                             clickShit={()=>this.changeLit(this.state.selectedMarker,this.state.selectedGeohash,-1)}
            />
  
            <AnimatedLeaderboard style = {{top:this.state.animatedLeaderboard}} 
                                 toggleLeaderBoard= {this.toggleLeaderBoard}
                                 leaderBoard_={this.state.leaderBoard_}
                                 renderImage={this.renderImage}
            />
  
            <AnimatedLeaderboardTab style = {{right:this.state.animatedLeaderboardButton}} 
                                    toggleLeaderBoard={this.toggleLeaderBoard}
            />

          </View>
      );
    }
  }