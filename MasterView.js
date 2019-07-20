import React from 'react';
import {Animated, View ,AppState} from 'react-native';
import SideTab from './SideTab.js';
import InfoPage from './InfoPage.js';
import Leaderboard from './Leaderboard.js';
import LeaderboardTab from './LeaderboardTab.js';
import AddHubTab from './AddHubTab.js'
import Hub from './Hub.js'
import './renderImage.js'
import {Constants} from 'expo';
import g from 'ngeohash'
import * as math from 'mathjs';
import * as firebase from 'firebase';
import 'firebase/firestore';
import ClusteringMap from './ClusteringMap.js';
import styles from './styles.js';

function getRandomInt(min,max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max-min))+min;
}

const AnimatedSideTab = Animated.createAnimatedComponent(SideTab);
const AnimatedInfoPage = Animated.createAnimatedComponent(InfoPage);
const AnimatedLeaderboard = Animated.createAnimatedComponent(Leaderboard);
const AnimatedLeaderboardTab = Animated.createAnimatedComponent(LeaderboardTab);
const AnimatedAddHubTab = Animated.createAnimatedComponent(AddHubTab);

export default class MasterView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      animatedAddHubTab: new Animated.Value(-3),
      animatedFlex: new Animated.Value(.5),
      animatedHeight: new Animated.Value(30),
      animatedLeaderboard: new Animated.Value(1000),
      animatedLeaderboardButton: new Animated.Value(-3),
      animatedTab:  new Animated.Value(500),
      animatedTop: new Animated.Value(1000),
      clustering: true,
      currentGrid: [],
      data_: [],
      error: null,
      geoHashGrid: {},
      ghostMarker: [],
      infoPage: false,
      infoPageMarker: null,
      leaderBoard: false,
      leaderBoard_: [],
      locationResult:null,
      mapRegion: {
        latitude: null,
        latitudeDelta: null,
        longitude: null,
        longitudeDelta: null
      },
      markers_: {},
      selectedMarker: null,
      showVotingButtons: true,
      tabVal: false,
      userLocation: {
        formattedAddress: null,
        latitude: null,
        longitude: null
      },
    };
  
    this.showVotingButtonsHandler = this.showVotingButtonsHandler.bind(this);
    this.selectedMarkerHandler= this.selectedMarkerHandler.bind(this);
    this.tabValHandler = this.tabValHandler.bind(this);
    this.mapRegionHandler = this.mapRegionHandler.bind(this);
    this.currentGridHandler = this.currentGridHandler.bind(this);
    this.ghostMarkerHandler = this.ghostMarkerHandler.bind(this);
    this.geoHashGridHandler = this.geoHashGridHandler.bind(this);

    this._addListener = this._addListener.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.changeLit = this.changeLit.bind(this);
    this.toggleInfoPage = this.toggleInfoPage.bind(this);
    this.toggleLeaderBoard = this.toggleLeaderBoard.bind(this);
    this.goToMarker = this.goToMarker.bind(this);
    this.openTab = this.openTab.bind(this);
    this.closeTab = this.closeTab.bind(this);
    this._addWatchPosition = this._addWatchPosition.bind(this);

    this.setGhost = this.setGhost.bind(this);
  }

  openTab(marker) {
    // Checks if marker is a ghost. if a ghostMarker is clicked then call hideTab()
    if(this.state.geoHashGrid[marker.geohash] === undefined || !Object.keys(this.state.geoHashGrid[marker.geohash]).includes(marker.location.address)) {
      this.closeTab(true);
    }
    // change selectedAddress to the new address if the selected marker is not at selectedAddress
    else if(this.state.selectedMarker !== marker) {

      if(marker.location.address in this.state.userLocation.userAddressDictionary) {
        this.setState({showVotingButtons: true})
      } else {
        this.setState({showVotingButtons: true})
      }

      if (!this.state.tabVal) {
        this.setState({tabVal:true})
        Animated.timing(this.state.animatedTab, {
          toValue: 370,
          friction: 100,
          duration: 200
        }).start();
      }
      this.setState({selectedMarker: marker});
    } 
  }

  closeTab(deleteGhost) {
    if (this.state.tabVal) {
      this.setState({tabVal:false});
      Animated.timing(this.state.animatedTab, {
        toValue: 1000,
        friction: 200,
        duration: 200
      }).start();
    }
    
    if (deleteGhost) {
      // console.log("hello")
      this.setState({selectedMarker: null});
      var deleteGhost = []
      this.ghostMarkerHandler(deleteGhost)
    }
  }
  
  componentDidMount() {
    this._addWatchPosition()
    AppState.addEventListener('change', this._handleAppStateChange)
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchId);
    AppState.removeEventListener('change',this._handleAppStateChange)
  }

  componentWillMount() {
    this._getDeviceInfoAsync();
  }

  _handleAppStateChange = (nextAppState) => {
    console.log('AppState changed to', nextAppState)
    if (nextAppState == 'active') {
      this._addWatchPosition()
    } else if(nextAppState == 'background') {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }

  _addWatchPosition = async() => {
    // updates the userLocation prop when the user moves a significant amount
    this.watchID = navigator.geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        let ghostGeohash = g.encode_int(latitude,longitude,26)
        // Fetch curent location
        myApiKey = 'AIzaSyBkwazID1O1ryFhdC6mgSR4hJY2-GdVPmE';
        fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&location_type=ROOFTOP&result_type=street_address|premise&key=' + myApiKey)
        .then((response) => response.json())
        .then((responseJson) => {
          let results = JSON.parse(JSON.stringify(responseJson)).results
          let userAddressDictionary = {}
          // creates a dictionary of all possible locations returned by the fetch
          // TODO: trim down results to only important ones. Remove results that are renages of numbers and limit returns
          results.forEach( result => {
              let city, street, number = null;
              counter = 0
              while (!city || !street || !number) {
                result.address_components[counter].types.forEach(type => {
                  if (type == "locality") {
                    // might need to change this to neighborhood work on tuning
                    city = result.address_components[counter].long_name;
                  }
                  if (type == "route") {
                    street = result.address_components[counter].short_name;
                  }
                  if (type == "street_number") {
                    number = result.address_components[counter].long_name;
                  }
                })
                counter+=1;
              }
              
            userAddressDictionary[result.formatted_address] = {
              coord: result.geometry.location,
              geohash: ghostGeohash,
              city: city,
              street: street,
              number: number,
            };
          })

          let userCity = null;
          results[0].address_components.forEach( component => {
            component.types.forEach( type => {
              if (type == "locality") {
                      userCity = component.long_name;
              }
            })
          })
          // saves address, latitude, and longitude in a coordinate object
          // console.log("userAddressDictionary",userAddressDictionary)
          const userCoordinates = {
            userCity,
            userAddressDictionary,
            latitude,
            longitude
          };
          // sets new userLocation based on previously created coordinate object
          this.setState({userLocation: userCoordinates});
        })
      },

      (error) => console.log(error),
      {enableHighAccuracy: true, distanceFilter: 1, timeout:250}
    )
  }

  goToMarker(marker) {
    if (this.state.infoPage) {
      this.toggleInfoPage(marker)
    }
    if (this.state.leaderBoard) {
      this.toggleLeaderBoard()
    }

    // this.state.geoHashGrid[geohash][markerAddress].borderColor = "#e8b923"
    this.openTab(marker)
    let locationObj = {};
    locationObj.coordinates = marker.coordinate
    locationObj.coordinates.latitudeDelta = 0.0005
    locationObj.coordinates.longitudeDelta = 0.0005
    locationObj.address = marker.address
    this.setState({
      moveToLocation: locationObj
    })
  }

  _addListener = async() => {
    listener = db.collection('locations')
    .where("geohash", "array-contains", await this.state.currentGrid[0])
    .onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        let newGrid = {...this.state.geoHashGrid};
        let newDictionary = {}

        // Create a new location and add it to the markers dictionary when a new document is added to the listener.
        if (change.type === 'added'){
          // // *untested* Should reset tab and remove ghost marker if youre about to vote on a location that was just voted on.
          // if (this.state.ghostMarker.length > 0 && change.doc.id == this.state.ghostMarker[0].address) {
          //   console.log("listener")
          //   this.closeTab(true);
          // }
          let count = change.doc.data().count ? change.doc.data().count : 0
          let hub = new Hub(
            {
              latitude: change.doc.data().latitude,
              longitude: change.doc.data().longitude
            },
            {
              latitude: change.doc.data().latitude,
              longitude: change.doc.data().longitude,
              address: change.doc.id,
              city: change.doc.data().city,
              street: change.doc.data().street,
              number: change.doc.data().number,
            },
            false,
            change.doc.data().geohash[0],
            {
              cost: count,
              upVotes: change.doc.data().upVotes,
              downVotes: change.doc.data().downVotes,
            },
            change.doc.id,
          )
          
          if (change.doc.data().geohash[0] in newGrid) {
            newDictionary = {...newGrid[change.doc.data().geohash[0]]}
          }
          newDictionary[change.doc.id] = hub
        } 

        else if(change.type === 'modified'){
          // update the data in the markers dictionary if a document in the listener has been modified.
          // this if statement may be redundant
          newDictionary = newGrid[change.doc.data().geohash[0]];
          newDictionary[change.doc.id].stats.cost = change.doc.data().count;
          newDictionary[change.doc.id].stats.upVotes = change.doc.data().upVotes;
          newDictionary[change.doc.id].stats.downVotes = change.doc.data().downVotes;
        }

        // delete location from markers_dictionary if document is removed from listener
        else if(change.type === 'removed') {
          if (this.state.selectedMarker.location.address == change.doc.id) {
            this.closeTab(true);
          }

          newDictionary = newGrid[change.doc.data().geohash[0]];
          delete newDictionary[change.doc.id];
        }

        newGrid[change.doc.data().geohash[0]] = newDictionary;
        this.setState({geoHashGrid: newGrid})
      })
    })
  }
  
  /* this gets the Id for the phone. TODO: update to device ID after ejecting project
      installationID will likely only work for expo*/
  _getDeviceInfoAsync = async() => {
    console.log('retrieving info')
    var uniqueId = Constants.installationId;
    console.log(uniqueId);
  }

  showVotingButtonsHandler(someValue) {
    this.setState({
        showVotingButtons: someValue
    })
  }

  selectedMarkerHandler(someValue) {
    this.setState({
        selectedMarker: someValue
    })
  }

  ghostMarkerHandler(someValue) {
    if (someValue.length > 0) {
      this.setState({clustering: false});
    } else {
      this.setState({clustering: true});
    }
    this.setState({
      ghostMarker: someValue
    })
  }

  tabValHandler() {
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
  toggleInfoPage (marker) {
    // if infoPage is currently listed as false, open the page. Otherwise close it.
    if (!this.state.infoPage) {
      this.setState({infoPage: true});
      Animated.timing(this.state.animatedTop, {
        toValue: 50,
        duration: 300,
      }).start();

      Animated.timing(this.state.animatedLeaderboardButton, {
        toValue: -50,
        duration: 300
      }).start();
    
    } else {
      Animated.timing(this.state.animatedTop, {
        toValue: 1000,
        duration: 300
      }).start(()=>this.setState({infoPage: false}));
      
      if (!this.state.leaderBoard) {
        Animated.timing(this.state.animatedLeaderboardButton, {
          toValue: -3,
          duration: 300
        }).start();
      }
      
    }
    // closes the vote tab when the info page is up so that its not distracting.
    if (this.state.infoPage) {
      this.openTab(marker);
      this.setState({infoPageMarker: null});
      this.setState({selectedMarker: null});
    }
    // re opens the tab when the info page closes
    else {
      this.setState({infoPageMarker: marker});
      this.setState({selectedMarker: marker});
      this.closeTab(false)
    }
  }
  
  toggleLeaderBoard() {
    if (!this.state.leaderBoard) {
      this.setState({leaderBoard: true});
          
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
      }).start(()=> this.setState({leaderBoard: false}));

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
  }
  
    // Initializes the ghost marker to closest location in possible current locations
  setGhost(referenceLatitude, referenceLongitude) {
    let ghostAddress = null;
    let currentDistance = null;
    
    let availableLocations = Object.keys(this.state.userLocation.userAddressDictionary).map( address => {
      if (this.state.ghostMarker.length == 0) {
        return address;
      }
      else if (this.state.geoHashGrid[this.state.userLocation.userAddressDictionary[address].geohash] == undefined) {
        console.log('here')
        return address;
      }
      else if (!(address in this.state.geoHashGrid[this.state.userLocation.userAddressDictionary[address].geohash])||
                address == this.state.ghostMarker[0].location.address) {
        return address;
      } else {
        return null;
      }
    })

    console.log(availableLocations);
    if (availableLocations != undefined) {
      availableLocations.forEach(address => {
        if (address != null) {

          let distance = math.sqrt(
            math.square(referenceLatitude-this.state.userLocation.userAddressDictionary[address].coord.lat)
            + math.square(referenceLongitude-this.state.userLocation.userAddressDictionary[address].coord.lng)
          )

          if (ghostAddress == null) {
            ghostAddress = address;
            currentDistance = distance
          } else if (distance < currentDistance){
            ghostAddress = address;
            currentDistance = distance;
          }
        }
      })
      if (ghostAddress != null ) {
        
        let newGhostMarker = [];
        let hub = new Hub(
          {
            latitude: this.state.userLocation.userAddressDictionary[ghostAddress].coord.lat,
            longitude: this.state.userLocation.userAddressDictionary[ghostAddress].coord.lng
          },
            {
            latitude: this.state.userLocation.userAddressDictionary[ghostAddress].coord.lat,
            longitude: this.state.userLocation.userAddressDictionary[ghostAddress].coord.lng,
            address: ghostAddress,
            city: this.state.userLocation.userAddressDictionary[ghostAddress].city,
            street: this.state.userLocation.userAddressDictionary[ghostAddress].street,
            number: this.state.userLocation.userAddressDictionary[ghostAddress].number,
          },
          true,
          this.state.userLocation.userAddressDictionary[ghostAddress].geohash,
          {
            cost: 0,
            upVotes: 0,
            downVotes: 0,
          },
          Math.random()        
        )

        newGhostMarker.push(hub);

        this.showVotingButtonsHandler(false)
        this.tabValHandler()
        this.selectedMarkerHandler(hub)
        this.ghostMarkerHandler(newGhostMarker)

      } else {
        // show popup "move closer to location"
      }
    } else {
      // show popup "move closer to location"
    }
  }

    // Adds one positive or negative vote whether lit or shit is voted
  changeLit(marker,vote) {
    // recieve the ID from the user
    // var uniqueId = Constants.installationId;
    var uniqueId = Math.random().toString();
    // collect timestamp.
    var time = new Date();
    
    // Turns a ghostMarker into a regular marker by adding a new location to the database
    if (this.state.geoHashGrid[marker.geohash] == undefined || !Object.keys(this.state.geoHashGrid[marker.geohash]).includes(marker.location.address)){
      let latitude = this.state.ghostMarker[0].coordinate.latitude;
      let longitude = this.state.ghostMarker[0].coordinate.longitude;
      let city = this.state.ghostMarker[0].location.city;
      let street = this.state.ghostMarker[0].location.street;
      let number = this.state.ghostMarker[0].location.number;
      hashes = [g.encode_int(latitude,longitude,26)];
      hashNeighbors = g.neighbors_int(hashes[0],26);
      // get a reference to the document at this address in the database.
      let ref = db.collection('locations').doc(marker.location.address);
      ref.get()
        .then( doc => {
          // if the document doesnt yet exist, add a new one with base stats.
          if (!doc.exists) {
            ref.set({
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
        this.closeTab(true);

    // update votes if user is already in the database
    } else {
      // gets a reference to the document at the address.
      let ref = db.collection('locations').doc(marker.location.address).collection('votes').doc(uniqueId);
      return ref.get()
      .then( voteDoc => {
        // Do not let user vote multiple times but allow them to update an old vote
        if (voteDoc.exists) {
          // change vote to the opposite of the previous vote
          if (voteDoc.data().vote != vote) {
            ref.set({
              voteTime: time,
              vote: vote,
            })
          }
        } else {
          db.collection('locations').doc(marker.location.address).collection('votes').doc(uniqueId).set({
            voteTime: time,
            vote: vote,
          })
        }
      })
    }
  }
  
    // renders the onscreen info
  render() {
    return (
      <View style = {styles.bigContainer}>        
          <ClusteringMap onRef={ref => (this.child = ref)}
                geoHashGrid={this.state.geoHashGrid}
                closeTab={this.closeTab}
                selectedMarker={this.state.selectedMarker} 
                selectedMarkerHandler={this.selectedMarkerHandler}
                tabValHandler={this.tabValHandler}
                showVotingButtonsHandler={this.showVotingButtonsHandler} 
                ghostMarker={this.state.ghostMarker}
                mapRegionHandler={this.mapRegionHandler} 
                currentGridHandler={this.currentGridHandler}
                userLocation={this.state.userLocation} 
                ghostMarkerHandler={this.ghostMarkerHandler} 
                geoHashGridHandler={this.geoHashGridHandler} 
                openTab={this.openTab} 
                moveToLocation={this.state.moveToLocation}
                setGhost={this.setGhost}
                clustering={this.state.clustering}
          />

          {this.state.infoPage && <AnimatedInfoPage style = {{top:this.state.animatedTop}}
                            toggleInfoPage={() => this.toggleInfoPage(this.state.selectedMarker)}
                            infoPageMarker={this.state.infoPageMarker}
                            data_={this.state.data_}
                            leaderboardStatus = {this.state.leaderBoard}
                            goToMarker = {this.goToMarker}
          />}

          <AnimatedSideTab style = {{left:this.state.animatedTab}} 
                            clickInfo = {()=>this.toggleInfoPage(this.state.selectedMarker)} 
                            clickFire={()=>this.changeLit(this.state.selectedMarker,1)}
                            clickShit={()=>this.changeLit(this.state.selectedMarker,-1)}
          />

          {this.state.leaderBoard && <AnimatedLeaderboard style = {{top:this.state.animatedLeaderboard}} 
                                toggleLeaderBoard= {this.toggleLeaderBoard}
                                leaderBoard_={this.state.leaderBoard_}
                                toggleInfoPage={this.toggleInfoPage}
                                userCity = {this.state.userLocation.userCity}
          />}

          <AnimatedLeaderboardTab style = {{right:this.state.animatedLeaderboardButton}} 
                                  toggleLeaderBoard={this.toggleLeaderBoard}
          />

          <AnimatedAddHubTab style ={{right:this.state.animatedLeaderboardButton}}
                      setGhost={() => this.setGhost(this.state.userLocation.latitude, this.state.userLocation.longitude)}
          />     
        </View>
    );
  }
}