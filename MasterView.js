import React from 'react';
import {Animated, View ,AppState, Platform, Button, Text} from 'react-native';
import ErrorBanner from './ErrorBanner.js';
import SideTab from './SideTab.js';
import InfoPage from './InfoPage.js';
import TutorialPage from './TutorialPage.js';
import Leaderboard from './Leaderboard.js';
import Hub from './Hub.js'
import ParentButtonTab from './ParentButtonTab.js';
import './renderImage.js'
import Constants from 'expo-constants';
import g, { neighbor } from 'ngeohash'
import * as math from 'mathjs';
import * as firebase from 'firebase';
import 'firebase/firestore';
import ClusteringMap from './ClusteringMap.js';
import styles from './styles.js';
import * as Location from 'expo-location';
import Dimensions from 'Dimensions';
import uberLink from './uberLink';
import googleMapsLink from './googleMapsLink.js';
import MoveToLocationButton from './MoveToLocationButton.js';
import PrivacyPolicyButton from './PrivacyPolicyButton.js';
import lyftLink from './lyftLink.js';

function getRandomInt(min,max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max-min))+min;
}

const AnimatedErrorBanner = Animated.createAnimatedComponent(ErrorBanner);
const AnimatedTutorialPage = Animated.createAnimatedComponent(TutorialPage);
const AnimatedSideTab = Animated.createAnimatedComponent(SideTab);
const AnimatedInfoPage = Animated.createAnimatedComponent(InfoPage);
const AnimatedLeaderboard = Animated.createAnimatedComponent(Leaderboard);
const AnimatedParentButtonTab = Animated.createAnimatedComponent(ParentButtonTab);

export default class MasterView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      animatedErrorBanner: new Animated.Value(-100),
      animatedTutorialPage: new Animated.Value(-100),
      animatedFlex: new Animated.Value(.5),
      animatedHeight: new Animated.Value(30),
      animatedLeaderboard: new Animated.Value(-100),
      animatedParentButtonTab: new Animated.Value(-.75),
      animatedTab:  new Animated.Value(-50),
      animatedTop: new Animated.Value(-100),
      bannerErrorMessage: null,
      bannerErrorState: false,
      clustering: true,
      connectionType: null,
      currentGrid: [],
      data_: [],
      geoHashGrid: {},
      ghostMarker: [],
      possibleLocationMarker: [],
      hubs: {},
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
      refreshingPosition: true,
      selectedMarker: null,
      showVotingButtons: true,
      tabVal: false,
      timesOpened: 1,
      tutorialPage: false,
      uniqueID: null,
      userLocation: {
        formattedAddress: null,
        latitude: null,
        longitude: null
      },
      watchID: null,
    };
  
    this.showVotingButtonsHandler = this.showVotingButtonsHandler.bind(this);
    this.selectedMarkerHandler= this.selectedMarkerHandler.bind(this);
    this.tabValHandler = this.tabValHandler.bind(this);
    this.mapRegionHandler = this.mapRegionHandler.bind(this);
    this.currentGridHandler = this.currentGridHandler.bind(this);
    this.ghostMarkerHandler = this.ghostMarkerHandler.bind(this);
    this.geoHashGridHandler = this.geoHashGridHandler.bind(this);
    this.bannerErrorHandler = this.bannerErrorHandler.bind(this);
    this.connectionTypeHandler = this.connectionTypeHandler.bind(this);

    this._addListener = this._addListener.bind(this);
    this.addListenerHandler = this.addListenerHandler.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.changeLit = this.changeLit.bind(this);
    this.toggleTutorialPage = this.toggleTutorialPage.bind(this);
    this.toggleInfoPage = this.toggleInfoPage.bind(this);
    this.toggleLeaderBoard = this.toggleLeaderBoard.bind(this);
    this.goToMarker = this.goToMarker.bind(this);
    this.openTab = this.openTab.bind(this);
    this.closeTab = this.closeTab.bind(this);
    this._addWatchPosition = this._addWatchPosition.bind(this);

    this.setGhost = this.setGhost.bind(this);
    this.animateToLocation = this.animateToLocation.bind(this);
    this.success = this.success.bind(this);
    this.getAddress = this.getAddress.bind(this);
  }

  openTab(marker,userLocation) {
    // Checks if marker is a ghost. if a ghostMarker is clicked then call hideTab()
    if(!Object.keys(this.state.hubs).includes(marker.location.address)) {
      this.closeTab(true);
    }
    // change selectedAddress to the new address if the selected marker is not at selectedAddress
    else {
      if (userLocation.userAddressDictionary == null) {
        this.setState({showVotingButtons: false});
      } else if (marker.location.address in userLocation.userAddressDictionary) {
        this.setState({showVotingButtons: true});
        console.log(true);
      } else {
        this.setState({showVotingButtons: false});
        console.log(false);
      }

      if (!this.state.tabVal) {
        this.setState({tabVal:true})
        Animated.timing(this.state.animatedTab, {
          toValue: 0,
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
        toValue: -50,
        friction: 200,
        duration: 200
      }).start();
    }
    
    if (deleteGhost) {
      this.setState({selectedMarker: null});
      this.setState({possibleLocationMarker: []});
      this.ghostMarkerHandler([])
    }
  }

  componentDidMount() {
    console.log("Dimensions", Dimensions.get('window').height, Dimensions.get('window').width)
    console.log("componentDidMount")
    AppState.addEventListener('change', this._handleAppStateChange)
  }

  componentWillUnmount() {
    // navigator.geolocation.clearWatch(this.watchId);
    this.state.watchID;
    AppState.removeEventListener('change',this._handleAppStateChange)
  }

  componentWillMount() {
    this._addWatchPosition()
    this._getDeviceInfoAsync();
  }

  _handleAppStateChange = (nextAppState) => {
    console.log('AppState changed to', nextAppState)
    if (nextAppState == 'active') {
      this.setState({timesOpened: this.state.timesOpened + 1});
      this._addWatchPosition()
      if (this.state.timesOpened%5 == 0) {
        this.props.showInterstitialAd();
      }
    } else if(nextAppState == 'background') {
      this.state.watchID
    }
  }

  getAddress(latitude,longitude,marker) {
    if ((this.state.userLocation.userAddressDictionary == null) && (this.state.userLocation.speed < 5)) {
      let timeout = setTimeout(()=>{
        if (this.state.bannerErrorState != "locked") {
          this.setState({bannerErrorState: true});
          this.setState({bannerErrorMessage: "We are having trouble reaching our servers. Please check your connection and try again."})
        }
  
      },10000)
      let ghostGeohash = g.encode_int(this.state.userLocation.latitude,this.state.userLocation.longitude,26)
      // Fetch curent location
      myApiKey = apiKey;
      fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + this.state.userLocation.latitude + ',' + this.state.userLocation.longitude + '&location_type=ROOFTOP&result_type=street_address|premise&key=' + myApiKey)
      .then((response) => response.json())
      .then((responseJson) => {
        clearTimeout(timeout)
        let status = JSON.parse(JSON.stringify(responseJson)).status;
        console.log(status);
        if (this.state.bannerErrorState != "locked") {
          if (status == "ZERO_RESULTS") {
            this.setState({bannerErrorState: true});
            this.setState({bannerErrorMessage: "There do not appear to be any possible hub locations nearby. Please move closer to a building or check your conenction."})
          } else if (status == "OK") {
            this.setState({bannerErrorState: false});
            this.setState({bannerErrorMessage: null})
          }
        }
        let results = JSON.parse(JSON.stringify(responseJson)).results
        let userAddressDictionary = {}
        // creates a dictionary of all possible locations returned by the fetch
        results.forEach( result => {
            let state, street, administrative_area_level_3, locality, neighborhood, number = null;
            counter = 0
            while ((!state || !locality || !administrative_area_level_3 || !street || !number || !neighborhood) && counter < result.address_components.length) {
              result.address_components[counter].types.forEach(type => {
                if (type == "administrative_area_level_1") {
                  state = result.address_components[counter].short_name;
                }
                if (type == "locality") {
                  // might need to change this to neighborhood work on tuning
                  locality = result.address_components[counter].long_name;
                }
                if (type == "administrative_area_level_3") {
                  administrative_area_level_3 = result.address_components[counter].long_name;
                }
                if (type == "neighborhood") {
                  neighborhood = result.address_components[counter].long_name
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
          if ((street!=undefined) && (number != null)) {
            userAddressDictionary[result.formatted_address] = {
              coord: result.geometry.location,
              geohash: ghostGeohash,
              state: state,
              locality: locality,
              administrative_area_level_3: administrative_area_level_3,
              neighborhood: neighborhood,
              city: locality != null ? locality:administrative_area_level_3,
              street: street,
              number: number,
            };
          }
        })  
        // saves address, latitude, and longitude in a coordinate object
        const userCoordinates = {
          userAddressDictionary,
          latitude,
          longitude,
          speed: this.state.userLocation.speed
        };
        // sets new userLocation based on previously created coordinate object
        if (marker == null) {
          this.setState({userLocation: userCoordinates},
             this.setGhost(latitude, longitude, userCoordinates));
        } else {
          this.setState({userLocation: userCoordinates},
            this.openTab(marker,userCoordinates));
        }
      })
    } else if (this.state.userLocation.speed < 6) {
      if (marker == null) {
        this.setGhost(latitude, longitude, this.state.userLocation);
      } else {
        this.openTab(marker, this.state.userLocation)
      }
    } else {
      if (marker == null) {
        this.bannerErrorHandler({state: true, message: "Looks like you’re moving too fast! Slow down and check out a place before you vote"})
      } else {
        this.openTab(marker, this.state.userLocation);
      }
    }

  }

  success = async(position) => {
    let { latitude, longitude, speed } = position.coords;
    // let latitude = 42.296919;
    // let longitude = -83.721103;
    const userCoordinates = {
        userAddressDictionary: null,
        longitude,
        latitude,
        speed
    }
    this.setState({userLocation: userCoordinates});
    this.setState({refreshingPosition: false})
  }

  animateToLocation = async() => {
    let locationObj = {};
    locationObj.coordinates = {};
    locationObj.coordinates.latitude =  this.state.userLocation.latitude
    locationObj.coordinates.longitude =  this.state.userLocation.longitude
    locationObj.coordinates.latitudeDelta =  0.0005
    locationObj.coordinates.longitudeDelta =  0.0005

    this.clusterMap.animateToSpecificMarker(locationObj) 
  }

  _addWatchPosition = async() => {
    console.log("addWatchPosition")
    // updates the userLocation prop when the user moves a significant amount
    let watchID = await Location.watchPositionAsync(
      {accuracy: 5, setInterval: 10000, distanceInterval: 3},
      (position) => this.success(position)
    )
    this.setState({watchID});
  }

  goToMarker(marker) {
    
    if (this.state.infoPage) {
      this.toggleInfoPage(marker)
    }
    if (this.state.leaderBoard) {
      this.toggleLeaderBoard()
    }

    let locationObj = {};
    locationObj.coordinates = marker.coordinate
    locationObj.coordinates.latitudeDelta = 0.0005
    locationObj.coordinates.longitudeDelta = 0.0005
    locationObj.address = marker.location.address

    
    this.clusterMap.animateToSpecificMarker(locationObj);
    this.getAddress(this.state.userLocation.latitude,this.state.userLocation.longitude,marker)
  }

  _addListener = async(mapRegion) => {
    let latitude = mapRegion.latitude;
    let longitude = mapRegion.longitude;
    let radius = mapRegion.latitudeDelta*120/2;
    if (Object.keys(this.state.hubs).length > 50) {
      console.log("wipe");
      let cleanHubs = {};
      this.setState({hubs: cleanHubs})
      hubListener();
    }
    hubListener = hubs
    .near({center: new firebase.firestore.GeoPoint(latitude, longitude), radius: radius})
    .onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        let newHubsDictionary = {...this.state.hubs};

        // Create a new location and add it to the markers dictionary when a new document is added to the listener.
        if (change.type === 'added'){
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
          
          newHubsDictionary[change.doc.id] = hub;
        } 

        else if(change.type === 'modified'){
          // update the data in the markers dictionary if a document in the listener has been modified.

          newHubsDictionary[change.doc.id].stats.cost = change.doc.data().count;
          newHubsDictionary[change.doc.id].stats.upVotes = change.doc.data().upVotes;
          newHubsDictionary[change.doc.id].stats.downVotes = change.doc.data().downVotes;
        }

        // delete location from markers_dictionary if document is removed from listener
        else if(change.type === 'removed') {
          if (this.state.selectedMarker && this.state.selectedMarker.location.address === change.doc.id) {
            this.closeTab(true);
          }
          delete newHubsDictionary[change.doc.id];
        }
        this.setState({hubs: newHubsDictionary});
      })
    })
  }
  
  /* this gets the Id for the phone. TODO: update to device ID after ejecting project
      installationID will likely only work for expo*/
  _getDeviceInfoAsync = async() => {
    console.log('retrieving info')
    let uniqueId = Constants.installationId;
    console.log("unique id",uniqueId);
    this.setState({uniqueID: uniqueId});
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

  connectionTypeHandler(someValue) {
    this.setState({
      connectionType: someValue
    })
  }

  bannerErrorHandler(someValue) {
    this.setState({
      bannerErrorState: someValue.state
    });
    this.setState({
      bannerErrorMessage: someValue.message
    });
  }

  tabValHandler() {
    Animated.timing(this.state.animatedTab, {
      toValue: 0,
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



  addListenerHandler(mapRegion) {
    this._addListener(mapRegion);
  }

  toggleTutorialPage () {
    console.log("tutorial page toggled")
    if (!this.state.tutorialPage) {
      this.setState({tutorialPage: true});
      Animated.parallel(
        Animated.timing(this.state.animatedTutorialPage, {
          toValue: 5,
          duration: 300,
        }).start(),

        Animated.timing(this.state.animatedParentButtonTab, {
          toValue: -50,
          duration: 300
        }).start(),

        Animated.timing(this.state.animatedTab, {
          toValue: -50,
          friction: 100,
          duration: 200
        }).start(),
      )
    } else {
      this.setState({tutorialPage: false});
      Animated.parallel(
        Animated.timing(this.state.animatedTutorialPage, {
          toValue: !this.state.leaderBoard? -100 : 5,
          duration: 300
        }).start(()=>this.setState({infoPage: false})),

        Animated.timing(this.state.animatedParentButtonTab, {
          toValue: !this.state.leaderBoard? -.75 : -50,
          duration: 300
        }).start(),
        
        Animated.timing(this.state.animatedTab, {
          toValue: this.state.tabVal? 0 : -50,
          friction: 100,
          duration: 300
        }).start()
      )
    }
  }

  // Toggles the info page on a hub
  toggleInfoPage (marker) {
    // if infoPage is currently listed as false, open the page. Otherwise close it.
    if (!this.state.infoPage) {
      this.setState({infoPage: true});
      Animated.parallel(
        Animated.timing(this.state.animatedTop, {
          toValue: 5,
          duration: 300,
        }).start(),

        Animated.timing(this.state.animatedParentButtonTab, {
          toValue: -50,
          duration: 300
        }).start(),
      )
    } else {
      Animated.parallel(
        Animated.timing(this.state.animatedTop, {
          toValue: !this.state.leaderBoard? -100 : 5,
          duration: 300
        }).start(()=>this.setState({infoPage: false})),

        Animated.timing(this.state.animatedParentButtonTab, {
          toValue: !this.state.leaderBoard? -.75 : -50,
          duration: 300
        }).start(),
      )
    }
    // closes the vote tab when the info page is up so that its not distracting.
    if (this.state.infoPage && !this.state.leaderBoard) {
      this.getAddress(this.state.userLocation.latitude,this.state.userLocation.longitude,marker);
      this.setState({infoPageMarker: null});
      // this.setState({selectedMarker: null});
    }
    // re opens the tab when the info page closes
    else {
      this.setState({infoPageMarker: marker});
      // this.setState({selectedMarker: marker});
      this.closeTab(false)
    }
  }
  
  toggleLeaderBoard() {
    if (!this.state.leaderBoard) {
      this.setState({leaderBoard: true});
      Animated.parallel(
        Animated.timing(this.state.animatedLeaderboard, {
          toValue: 5,
          friction: 100,
          duration: 300
        }).start(),
        Animated.timing(this.state.animatedParentButtonTab, {
          toValue: -50,
          friction: 100,
          duration: 300
        }).start(),
        Animated.timing(this.state.animatedTab, {
          toValue: -50,
          friction: 100,
          duration: 300
        }).start(),
      ) 

    } else {
      Animated.parallel(
        Animated.timing(this.state.animatedLeaderboard, {
          toValue: -100,
          friction: 100,
          duration: 300
        }).start(()=> this.setState({leaderBoard: false})),

        Animated.timing(this.state.animatedParentButtonTab, {
          toValue: -.75,
          friction: 100,
          duration: 300
        }).start(),
    
        Animated.timing(this.state.animatedTab, {
          toValue: this.state.tabVal? 0 : -50,
          friction: 100,
          duration: 300
        }).start()
      )
    }
  }
    // Initializes the ghost marker to closest location in possible current locations
  setGhost(referenceLatitude, referenceLongitude, userCoordinates) {
    if(!this.state.tabVal) {
      let ghostAddress = null;
      let currentDistance = null;
      let hubLocationsAvailable = false;
      
      let availableLocations = Object.keys(userCoordinates.userAddressDictionary).map( address => {
        if(!Object.keys(this.state.hubs).includes(address)) {
          hubLocationsAvailable = true;
          return address;
        } else {
          return null;
        }
      })
      console.log("availableLocations", availableLocations);
      console.log(hubLocationsAvailable)
      if (hubLocationsAvailable != false) {
        let possibleMarkers = []
        availableLocations.forEach(address => {
          if (address != null) {
            let marker = {
              coordinate: {
                latitude: userCoordinates.userAddressDictionary[address].coord.lat,
                longitude: userCoordinates.userAddressDictionary[address].coord.lng
              }, 
              location: {
                latitude: userCoordinates.userAddressDictionary[address].coord.lat,
                longitude: userCoordinates.userAddressDictionary[address].coord.lng
              },
              ghostMarker: "possible location",
              key: Math.random()        
            }

            possibleMarkers.push(marker)

            let distance = math.sqrt(
              math.square(referenceLatitude-userCoordinates.userAddressDictionary[address].coord.lat)
              + math.square(referenceLongitude-userCoordinates.userAddressDictionary[address].coord.lng)
            )

            if (ghostAddress == null || distance < currentDistance) {
              ghostAddress = address;
              currentDistance = distance
            } 
          }
        })
        if (ghostAddress != null ) {
          
          let newGhostMarker = [];
          let hub = new Hub(
            {
              latitude: userCoordinates.userAddressDictionary[ghostAddress].coord.lat,
              longitude: userCoordinates.userAddressDictionary[ghostAddress].coord.lng,
            },
            {
              latitude: userCoordinates.userAddressDictionary[ghostAddress].coord.lat,
              longitude: userCoordinates.userAddressDictionary[ghostAddress].coord.lng,
              address: ghostAddress,
              state: userCoordinates.userAddressDictionary[ghostAddress].state,
              locality: userCoordinates.userAddressDictionary[ghostAddress].locality,
              administrative_area_level_3: userCoordinates.userAddressDictionary[ghostAddress].administrative_area_level_3,
              neighborhood: userCoordinates.userAddressDictionary[ghostAddress].neighborhood,
              city: userCoordinates.userAddressDictionary[ghostAddress].city,
              street: userCoordinates.userAddressDictionary[ghostAddress].street,
              number: userCoordinates.userAddressDictionary[ghostAddress].number,
            },
            true,
            userCoordinates.userAddressDictionary[ghostAddress].geohash,
            {
              cost: 0,
              upVotes: 0,
              downVotes: 0,
            },
            Math.random()        
          )
          possibleMarkers = possibleMarkers.filter((marker) => {
            return (marker.coordinate.latitude !== hub.coordinate.latitude &&
                    marker.coordinate.longitude !== hub.coordinate.longitude
            )
          })

          newGhostMarker.push(hub);

          let locationObj = {};
          locationObj.coordinates = {};
          locationObj.coordinates.latitude =  hub.coordinate.latitude
          locationObj.coordinates.longitude =  hub.coordinate.longitude
          locationObj.coordinates.latitudeDelta =  0.0005
          locationObj.coordinates.longitudeDelta =  0.0005
      
          this.clusterMap.animateToSpecificMarker(locationObj) 
          this.showVotingButtonsHandler(!(hub.location.address in this.state.hubs));
          this.tabValHandler()
          this.selectedMarkerHandler(hub)
          this.ghostMarkerHandler(newGhostMarker)
          this.setState({
            possibleLocationMarker: possibleMarkers
          })
        } else {
          // show popup "move closer to location"
        }
      } else {
        this.bannerErrorHandler({state: true, message: "There appear to be no available locations nearby to place a hub. Please move closer to your desired location or vote on a current hub!"})
        // show popup "move closer to location"
      }
    }
  }

    // Adds one positive or negative vote whether lit or shit is voted
  changeLit(marker,vote) {
    // recieve the ID from the user
    // let uniqueId = this.state.uniqueID
    let uniqueId = Math.random().toString();
    // collect timestamp.
    let time = new Date();
    
    if (!Object.keys(this.state.hubs).includes(marker.location.address)){
      let latitude = this.state.ghostMarker[0].coordinate.latitude;
      let longitude = this.state.ghostMarker[0].coordinate.longitude;
      let state = this.state.ghostMarker[0].location.state;
      let locality = this.state.ghostMarker[0].location.locality;
      let administrative_area_level_3 = this.state.ghostMarker[0].location.administrative_area_level_3;
      let neighborhood = this.state.ghostMarker[0].location.neighborhood;
      let city = this.state.ghostMarker[0].location.city;
      let street = this.state.ghostMarker[0].location.street;
      let number = this.state.ghostMarker[0].location.number;
      geohash = [g.encode_int(latitude,longitude,26)];
      // get a reference to the document at this address in the database.

      hubs.doc(marker.location.address).get()
        .then( doc => {
          // if the document doesnt yet exist, add a new one with base stats.
          if (!doc.exists) {
            hubs.doc(marker.location.address).set({
              coordinates: new firebase.firestore.GeoPoint(latitude, longitude),
              timeCreated: time,
              latitude:  latitude,
              longitude: longitude,
              geohash: geohash,
              imagePath: './assets/logs.png',
              state: state,
              locality: locality == undefined ? null : locality,
              administrative_area_level_3: administrative_area_level_3 == undefined ? null : administrative_area_level_3,
              neighborhood: neighborhood == undefined ? null : neighborhood,
              city: city,
              street: street,
              number: number
            })
            // add a new vote to the votes on this document with the users uniqueID.
            hubs.doc(marker.location.address).collection('votes').doc(uniqueId).set({
              coordinates: new firebase.firestore.GeoPoint(latitude, longitude),
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
      hubs.doc(marker.location.address).collection('votes').doc(uniqueId).get()
      .then( voteDoc => {
        // Do not let user vote multiple times but allow them to update an old vote
        if (voteDoc.exists) {
          // change vote to the opposite of the previous vote
          if (voteDoc.data().vote != vote) {
            hubs.doc(marker.location.address).collection('votes').doc(uniqueId).update({
              coordinates: new firebase.firestore.GeoPoint(10, 20),
              vote: vote,
            })
          }
        } else {
          hubs.doc(marker.location.address).collection('votes').doc(uniqueId).set({
            coordinates: new firebase.firestore.GeoPoint(10, 20),
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
          {<ClusteringMap onRef={ref => (this.clusterMap = ref)}
                geoHashGrid={this.state.geoHashGrid}
                hubs = {this.state.hubs}
                closeTab={this.closeTab}
                addListenerHandler={this.addListenerHandler}
                selectedMarker={this.state.selectedMarker} 
                selectedMarkerHandler={this.selectedMarkerHandler}
                tabValHandler={this.tabValHandler}
                showVotingButtonsHandler={this.showVotingButtonsHandler} 
                ghostMarker={this.state.ghostMarker}
                possibleLocationMarker = {this.state.possibleLocationMarker}
                mapRegionHandler={this.mapRegionHandler} 
                mapRegion={this.state.mapRegion}
                currentGridHandler={this.currentGridHandler}
                userLocation={this.state.userLocation} 
                ghostMarkerHandler={this.ghostMarkerHandler} 
                geoHashGridHandler={this.geoHashGridHandler} 
                getAddress={this.getAddress}
                clustering={this.state.clustering}
                pageErrorHandler={this.props.pageErrorHandler}
                bannerErrorHandler={this.bannerErrorHandler}
                addWatchPosition={this._addWatchPosition}
                removeWatchPosition={this.state.watchPosition}
                connectionTypeHandler={this.connectionTypeHandler}
          />}

          {/* <AdBanner/> */}

          {this.state.bannerErrorState && <AnimatedErrorBanner style = {styles.errorBanner}
                error={this.state.bannerErrorMessage}
                animateToLocation={this.animateToLocation}
                connectionType={this.state.connectionType}
                bannerErrorHandler={this.bannerErrorHandler}
          />}

          {this.state.infoPage && <AnimatedInfoPage style = {{top:this.state.animatedTop.interpolate({inputRange: [-100,5], outputRange: ["-100%","5%"]})}}
                toggleInfoPage={this.toggleInfoPage}
                infoPageMarker={this.state.infoPageMarker}
                data_={this.state.data_}
                leaderboardStatus = {this.state.leaderBoard}
                clickNavigate={()=>{
                  let mapsLink = new googleMapsLink(this.state.infoPageMarker);
                  mapsLink.openMaps();
                }}
                clickUber={()=>{
                  let uberLink_ = new uberLink(this.state.infoPageMarker);
                  uberLink_.openUber();
                }}
                clickLyft={()=>{
                  let liftLynk_ = new lyftLink(this.state.infoPageMarker,this.state.userLocation);
                  liftLynk_.openLyft();
                }}
                goToMarker = {() => this.goToMarker(this.state.infoPageMarker)}
          />}

          {<AnimatedSideTab style = {{right:this.state.animatedTab.interpolate({inputRange: [-50,0], outputRange: ["-50%","0%"]})}} 
                clickInfo = {()=>this.toggleInfoPage(this.state.selectedMarker)} 
                clickFire={()=>this.changeLit(this.state.selectedMarker,1)}
                clickShit={()=>this.changeLit(this.state.selectedMarker,-1)}
                showVotingButtons={this.state.showVotingButtons}
          />}

          {this.state.leaderBoard && <AnimatedLeaderboard style = {{top: this.state.animatedLeaderboard.interpolate({inputRange: [-100,5], outputRange: ["-100%","5%"]})}} 
                toggleLeaderBoard= {this.toggleLeaderBoard}
                leaderBoard_={this.state.leaderBoard_}
                toggleInfoPage={this.toggleInfoPage}
                mapRegion = {this.state.mapRegion}
                userLocation = {this.state.userLocation}
                bannerErrorHandler = {this.bannerErrorHandler}
                bannerErrorState = {this.bannerErrorState}
          />}
          {this.state.tutorialPage && <AnimatedTutorialPage style = {{top: this.state.animatedTutorialPage.interpolate({inputRange: [-100,5], outputRange: ["-100%","5%"]})}} 
                toggleTutorialPage={this.toggleTutorialPage}
          />}

          {<AnimatedParentButtonTab style = {{right: this.state.animatedParentButtonTab.interpolate({inputRange: [-50,-.75], outputRange: ["-50%","-.75%"]})}}
                toggleLeaderBoard={this.toggleLeaderBoard}
                setGhost={() => this.getAddress(this.state.userLocation.latitude,this.state.userLocation.longitude,null)}
                toggleTutorialPage={this.toggleTutorialPage}
          />}

          {<MoveToLocationButton
            animateToLocation={() => this.animateToLocation()}
          />}
          {/* <PrivacyPolicyButton/> */}
        </View>
    );
  }
}
