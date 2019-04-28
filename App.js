import React from 'react';
import { TouchableOpacity,TouchableHighlight,Vibration,Animated,Alert, StyleSheet, Text, View, Dimensions, Button, Image } from 'react-native';
import MapView,{ Marker, PROVIDER_GOOGLE } from 'react-native-maps';
// import { createSwitchNavigator, createStackNavigator, NavigationEvents } from 'react-navigation';
import {Constants, Location, Permissions} from 'expo';
import { white } from 'ansi-colors';
import * as math from 'mathjs';
import * as firebase from 'firebase';
import 'firebase/firestore';
// import DeviceInfo from 'react-native-device-info';


// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD2YhfO1TBYNOAWSxGwXQocAikqLuCRl7Q",
  authDomain: "testing-617da.firebaseapp.com",
  databaseURL: "https://testing-617da.firebaseio.com",
  projectId: "testing-617da",
  storageBucket: "testing-617da.appspot.com",
    //messagingSenderId: "862420802331"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// const uniqueId = DeviceInfo.getUniqueID();

// console.log(uniqueID);

//import Panel from './components/Panel';  // Step 1

let id = 0;

function getRandomInt(min,max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max-min))+min;
}

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = { 
      pressStatus: false,
      showStatus: false,
      infoPage: false,
      tabVal: false,
      animatedFlex: new Animated.Value(.5),
      animatedHeight: new Animated.Value(30),
      animatedTop: new Animated.Value(1000),
      animatedTab:  new Animated.Value(500),
      locationResult:null,
      testtest:null,
      markers_: {},
      votableMarkers: [],
      //0.00000898311175 lat to 1 m
      //0.000000024953213 lng to 1 m
      selectedMarker:null,
      infoPageMarker:null,
      ghostMarker: [],
      mapRegion: {
        latitude: null,
        latitudeDelta: null,
        longitude: null,
        longitudeDelta: null
      },
      userLocation: {
        formattedAddress: null,
        latitude: null,
        longitude: null
      },
      error: null,
      testMarker: {
        coordinate: {latitude:78, longitude: 78},
        cost: 0,
        title: "kasdd",
      },
      testString: null,
    };


    this.onLongPressMap = this.onLongPressMap.bind(this);
    this.onRegionChangeComplete = this.onRegionChangeComplete.bind(this);
    // this.onUserLocationChange = this.onUserLocationChange.bind(this);
    // this.onPressMap = this.onPressMap.bind(this);
    this.handlePress = this.handlePress.bind(this);
    //this.componentDidMount = this.componentDidMount.bind(this);
    this._getLocationAsync = this._getLocationAsync.bind(this);
    this.closePopUp = this.closePopUp.bind(this);
    this.addLit = this.addLit.bind(this);
    this.toggleInfoPage = this.toggleInfoPage.bind(this);
    this.addNewLocation = this.addNewLocation.bind(this);
    this.toggleTab = this.toggleTab.bind(this);
    this.toggleTabMapPress = this.toggleTabMapPress.bind(this);
    this.hideTab = this.hideTab.bind(this);
    this.returnUpVotes = this.returnUpVotes.bind(this);
    this.returnDownVotes = this.returnDownVotes.bind(this);
  }

  // addMarker(region) {
  //   let now = (new Date).getTime();

  //   if (this.state.ladAddedMarker > now - 5000) {
  //     return;
  //   }
    
  //   this.setState({
  //     markers: [
  //       ...this.state.markers, {
  //         coordinate: region,
  //         key: id++
  //       }
  //     ],
  //     ladAddedMarker: now
  //   });
  // }

  componentDidMount() {
    this.watchID = navigator.geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        myApiKey = 'AIzaSyBkwazID1O1ryFhdC6mgSR4hJY2-GdVPmE';
        fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + latitude + ',' + longitude + '&key=' + myApiKey)
        .then((response) => response.json())
        .then((responseJson) => {
          var address = JSON.parse(JSON.stringify(responseJson)).results[0].formatted_address;
          const newCoordinate = {
            address,
            latitude,
            longitude
          };
          this.setState({userLocation: newCoordinate})
          console.log(newCoordinate, "\n");
          // console.log(2)
          // console.log(newCoordinate.address)
          // console.log(newCoordinate.latitude, " ", newCoordinate.longitude);
          // console.log(newCoordinate.latitude < this.state.userLocation.latitude + 0.0002694933525);
          // console.log(newCoordinate.latitude > this.state.userLocation.latitude - 0.0002694933525);
          // console.log(newCoordinate.longitude < this.state.userLocation.longitude + 0.000000748596382);
          // console.log(newCoordinate.longitude > this.state.userLocation.longitude - 0.000000748596382);
          let votableMarkers_ = [...this.state.votableMarkers];
          /*if within 30m of the last known user location or at the the marker
          is at the last known user address*/
          if ((newCoordinate.latitude < this.state.userLocation.latitude + 0.0002694933525
            && newCoordinate.latitude > this.state.userLocation.latitude - 0.0002694933525
            && newCoordinate.longitude < this.state.userLocation.longitude + 0.000000748596382
            && newCoordinate.longitude > this.state.userLocation.longitude - 0.000000748596382) || (newCoordinate.address == this.state.userLocation.address)) {
              if (!votableMarkers_.includes(newCoordinate.address)) {
                votableMarkers_.push[newCoordinate.address];
                console.log(newCoordinate.address);
                console.log(1);
              }
            }
          this.setState({votableMarkers: votableMarkers_});
        })
      }
    )
  }
  componentWillMount() {
    this._getLocationAsync();
    this._reverseLocationAsync();
    this._getDeviceInfoAsync();
  }

  _getLocationAsync = async() => {
    let{ status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        locationResult:'Permission to access location was deinied',
      });
    }

    let location = await Location.getCurrentPositionAsync({enableHighAccuracy: false});
    console.log("I AM DONE");
    this.setState({locationResult:JSON.stringify(location)});

    var initialPosition = {
      latitude: JSON.parse(this.state.locationResult).coords.latitude,
      longitude: JSON.parse(this.state.locationResult).coords.longitude
    }

    var initialRegion = {
      latitude: JSON.parse(this.state.locationResult).coords.latitude,
      longitude: JSON.parse(this.state.locationResult).coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }

    this.map.animateToRegion(initialRegion, 1);
    this.setState({region: initialRegion});
    this.setState(previousState => (
      { testMarker: {
        coordinate: initialPosition,
        cost: previousState.testMarker.cost,
      }}
    ));

    myApiKey = 'AIzaSyBkwazID1O1ryFhdC6mgSR4hJY2-GdVPmE';
    fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + this.state.testMarker.coordinate.latitude + ',' + this.state.testMarker.coordinate.longitude + '&key=' + myApiKey)
        .then((response) => response.json())
        .then((responseJson) => {
            this.setState({testString:JSON.parse(JSON.stringify(responseJson)).results[0].formatted_address});
    })
  };

  _reverseLocationAsync = async() => {
    let regionName =  await Location.reverseGeocodeAsync({latitude:42.275863,longitude:-83.72695});
    this.setState({testtest:JSON.stringify(regionName)});
  }

  _getDeviceInfoAsync = async() => {
    console.log('retrieving info')
    var uniqueId = Constants.installationId;
    console.log(uniqueId);
  }

  onLongPressMap = info => {
    let data = info.nativeEvent.coordinate
    // this.setState(ghostMarker: )
    this.addNewLocation(data.latitude, data.longitude);
    // if (!this.state.pressStatus) {
    //   Animated.timing(this.state.animatedFlex, {
    //     toValue: 1,
    //     duration: 250
    //   }).start();
    // } else {
    //   Animated.timing(this.state.animatedFlex, {
    //     toValue: .5,
    //     duration: 250
    //   }).start();
    // }
    // this.setState(previousState => (
    //   { pressStatus: !previousState.pressStatus }
    // ))

  }

  onRegionChangeComplete = mapRegion => {
    // console.log(region);
    this.setState({mapRegion}); 
  }

  // onUserLocationChange = locationInfo => {
  //   let userLocation = locationInfo.nativeEvent.coordinate;
  //   this.setState({userLocation});
  //   console.log(this.state.userLocation);
  // }

  toggleInfoPage () {
    // this.hideTab();
    if (!this.state.infoPage) {
      Animated.timing(this.state.animatedTop, {
        toValue: 50,
        friction: 100,
        duration: 300
      }).start();
    } else {
      Animated.timing(this.state.animatedTop, {
        toValue: 1000,
        friction: 100,
        duration: 200
      }).start();
    }
    if (this.state.infoPage) {
      this.toggleTab(this.state.infoPageMarker);
      this.setState({infoPageMarker: null})
    }
    else {
      this.setState({infoPageMarker: this.state.selectedMarker});
      this.hideTab();
    }
    this.setState(previousState => (
      { infoPage: !previousState.infoPage }
    ))
  }

  toggleTab(markerAddress) {
    console.log("tab toggled");
    if(!Object.keys(this.state.markers_).includes(markerAddress)) {
      this.hideTab();
    }
    else if(this.state.selectedMarker !== markerAddress) {        
      console.log('tabval ',this.state.tabVal);
      console.log(1);
      if (!this.state.tabVal) {
        console.log(2);
        Animated.timing(this.state.animatedTab, {
          toValue: 370,
          friction: 200,
          duration: 500
        }).start();
        this.setState(previousState => (
          { tabVal: !previousState.tabVal 
          }
        ))
        console.log('tabval ',this.state.tabVal);
      }

      this.setState({selectedMarker: markerAddress});
      console.log('selectedMarker ', this.state.selectedMarker);
    } 
    else{
      console.log(3);
      this.hideTab();
      // if (!Object.keys(this.state.markers_).includes(markerAddress)) {
      //   let newGhostMarker = [];
      //   this.setState({ghostMarker: newGhostMarker});
      // }
      console.log('selectedMarker ', this.state.selectedMarker);
    }
    
    
  }

  toggleTabMapPress = pressinfo => {
    if(pressinfo.nativeEvent.action !== "marker-press") {
      console.log('mappress');
      this.hideTab();
    }
    
  }

  hideTab() {
    Animated.timing(this.state.animatedTab, {
      toValue: 1000,
      friction: 200,
      duration: 500
    }).start();
    this.setState(previousState => (
      { tabVal: !previousState.tabVal }
    ))
    this.setState({selectedMarker: null});
    var deleteGhost = []
    this.setState({ghostMarker: deleteGhost});
  }

  handlePress() {
      if (!this.state.showStatus) {
        Animated.spring(this.state.animatedHeight, {
          toValue: 80,
          friction: 4
        }).start();
      } 

      this.setState(previousState => (
        { showStatus: !previousState.showStatus }
      ))
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
  addLit(address) {
    // var updated = false;
    var uniqueId = Constants.installationId;
    var time = new Date();
    // var time = new Date();
    if (Object.keys(this.state.markers_).includes(address)) {
      var ref = db.collection('locations').doc(address).collection('votes').doc(uniqueId);
      return ref.get()
      .then( voteDoc => {
        console.log('here')
        if (voteDoc.exists()) {
          if (voteDoc.data().newVote != 1) {
            console.log(voteDoc.data().newVote);
            var oldVote = voteDoc.data().newVote;
            var newVote = 1;
            ref.set({
              voteTime: time,
              oldVote: oldVote,
              newVote: newVote
            })
          }
        }
        else {
          db.collection('locations').doc(address).collection('votes').doc(uniqueId).set({
            voteTime: time,
            oldVote: 0,
            newVote: 1
          })
        }
      })
    } else {
      var ref = db.collection('locations').doc(address);
      console.log(address);
      ref.get()
        .then( doc => {
          if (!doc.exists) {
            ref.set({
              count: 0,
              upVotes: 0,
              downVotes: 0,
              percentVotesLastThirty: 0,
              percentVotesLastHour: 0,
              timeCreated: time,
              latitude:  coords.lat,
              longitude: coords.lng
            })
            ref.collection('votes').doc(uniqueId).set({
              voteTime: time,
              oldVote: 0,
              newVote: 1
            })
          }
        })
        this.hideTab(false);
    }
    
    // var transaction = db.runTransaction(t = (event) => {
    //     return event.get(ref)
    //     .then(doc => {
    //       var newCount = doc.data().count +1;
    //       event.update(ref, { count: newCount});
    //       updated = true;
    //       ref.collection('votes').doc(uniqueId).set({
    //         voteTime: time,
    //         currentCount: newCount
    //       })
    //     })
    // })
    // .catch(err => {
    //         console.log('Error getting document', err);
    // })
    
  }

  //UPDATED THIS TO WORK WITH DATBASE
  deleteLit(address) {
    // var updated = false;
    var uniqueId = Constants.installationId;
    var time = new Date();
    if (Object.keys(this.state.markers_).includes(address)) {
      var ref = db.collection('locations').doc(address).collection('votes').doc(uniqueId);
      return ref.get()
        .then( voteDoc => {
          console.log('here')
          if (voteDoc.exists) {
            if (voteDoc.data().newVote !== -1) {
              console.log(voteDoc.data().newVote);
              var oldVote = voteDoc.data().newVote;
              var newVote = -1;
              ref.set({
                voteTime: time,
                oldVote: oldVote,
                newVote: newVote
              })
            }
          }
          else {
            db.collection('locations').doc(address).collection('votes').doc(uniqueId).set({
              voteTime: time,
              oldVote: 0,
              newVote: -1
            })
          }
        })
    }else {
      var ref = db.collection('locations').doc(address);
      console.log(address);
      ref.get()
        .then( doc => {
          if (!doc.exists) {
            ref.set({
              count: 0,
              upVotes: 0,
              downVotes: 0,
              percentVotesLastThirty: 0,
              percentVotesLastHour:0,
              timeCreated: time,
              latitude:  coords.lat,
              longitude: coords.lng
            })
            ref.collection('votes').doc(uniqueId).set({
              voteTime: time,
              oldVote: 0,
              newVote: -1
            })
          }
        })
      this.hideTab(false);
    }
    // var transaction = db.runTransaction(t = (event) => {
    //     return event.get(ref)
    //     .then(doc => {
    //       var newCount = doc.data().count - 1;
    //       event.update(ref, { count: newCount});
    //       updated = true;
    //       ref.collection('votes').doc(uniqueId).set({
    //         voteTime: time,
    //         currentCount: newCount
    //       })
    //     })
    // })
    // .catch(err => {
    //         console.log('Error getting document', err);
    // })
  }

  addNewLocation = async(latitude_, longitude_) => {
    var address_ = null;
    var uniqueId = Constants.installationId;
    myApiKey = 'AIzaSyBkwazID1O1ryFhdC6mgSR4hJY2-GdVPmE';
    fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + latitude_ + ',' + longitude_ + '&key=' + myApiKey)
        .then((response) => response.json())
        .then((responseJson) => {
          var len = JSON.parse(JSON.stringify(responseJson)).results.length
          var i = 0;
          var minDist = -1;
          for (indx = 0; indx < len; indx++) {
            var dist = math.sqrt(math.square(latitude_-JSON.parse(JSON.stringify(responseJson)).results[indx].geometry.location.lat)+math.square(longitude_-JSON.parse(JSON.stringify(responseJson)).results[indx].geometry.location.lng));
            if (minDist == -1) {
              minDist = dist;
            }
            else if (dist < minDist) {
              minDist = dist;
              i = indx;
            }
          }
          address_ = JSON.parse(JSON.stringify(responseJson)).results[i].formatted_address;
          coords = JSON.parse(JSON.stringify(responseJson)).results[i].geometry.location;
          if (!Object.keys(this.state.markers_).includes(address_)) {
            // console.log(JSON.parse(JSON.stringify(responseJson)).results[0]);
              console.log("lat ",coords.lat)
              let newGhostMarker = [];
              newGhostMarker.push({
                  coordinate: {
                    latitude: coords.lat,
                    longitude: coords.lng
                  }                    
                });
                Animated.timing(this.state.animatedTab, {
                  toValue: 370,
                  friction: 200,
                  duration: 500
                }).start();
                this.setState(previousState => (
                  { tabVal: !previousState.tabVal 
                  }
                ))
              this.setState({selectedMarker: address_});
              this.setState({ghostMarker: newGhostMarker});
          }
        })
    }

  onPressMap() {
    // navigator.geolocation.getCurrentPosition(location =>
    //   this.setState(previousState => (
    //   { testMarker: {
    //     coordinate: {latitude:location.coords.latitude, longitude: location.coords.longitude},
    //     cost: previousState.testMarker.cost,
    //   }}
    // )));
    // console.log("asdad")
    // myApiKey = 'AIzaSyBkwazID1O1ryFhdC6mgSR4hJY2-GdVPmE';
    // fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + this.state.testMarker.coordinate.latitude + ',' + this.state.testMarker.coordinate.longitude + '&key=' + myApiKey)
    //     .then((response) => response.json())
    //     .then((responseJson) => {
    //         console.log(JSON.parse(JSON.stringify(responseJson)).results[0].formatted_address);
    //         this.setState({testString:JSON.parse(JSON.stringify(responseJson)).results[0].formatted_address});
    //         alert('ADDRESS GEOCODE is BACK!! => ' + JSON.parse(JSON.stringify(responseJson)).results[0].formatted_address);
    // })

    // this.setState(previousState => (
    //   { testMarker: {
    //     coordinate: previousState.testMarker.coordinate,
    //     cost: previousState.testMarker.cost+1.
    //   }}
    // ))
  }

  returnUpVotes(address) {
    if (this.state.markers_[address] != null) {
      return this.state.markers_[address].upVotes;
    }
    else {
      return null;
    }
  }

  returnDownVotes(address) {
    if (this.state.markers_[address] != null) {
      return this.state.markers_[address].downVotes;
    }
    else {
      return null;
    }
  }
  render() {
    return (
      
      <View style = {styles.bigContainer}>        
        <MapView
          ref={ref => { this.map = ref; } } 
                     
          zoomEnabled = {true}
          provider = {PROVIDER_GOOGLE}
          showsUserLocation = {true}
          onLongPress = {this.onLongPressMap}
          onPress = {this.toggleTabMapPress}
          onRegionChangeComplete = {this.onRegionChangeComplete}
          // onUserLocationChange = {this.onUserLocationChange}
          style={styles.container}
          initialRegion = {{
            latitude:37.7884459,
            longitude:-122.4066252,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        > 
          {Object.values(this.state.markers_).map( (marker) => {
            return (
              <MapView.Marker 
              {...marker} 
              // onPress={this.handlePress}
              onPress =  {() => this.toggleTab(marker.address)} 
              >
                <View style={styles.marker} >
                    <Text style={styles.text}>{marker.cost}</Text>
                </View>

                  {/* <MapView.Callout tooltip style={styles.test}>
                    <Button style={styles.marker} title = '💩' onPress = {()=>this.deleteLit(marker.address)} />
                    <Button style={styles.marker} title = '🔥' onPress = {()=>this.addLit(marker.address)} />
                    <Text>|</Text>
                    <Button style={styles.marker} title = 'ⓘ' onPress={this.toggleInfoPage} />
                  </MapView.Callout> */}

              </MapView.Marker>
            )
          })}
          {this.state.ghostMarker.map( (marker) => {
            return (
              <MapView.Marker 
              {...marker} 
              // onPress={this.handlePress}
              onPress =  {() => this.toggleTab(marker.address)} 
              >
                <View style={styles.ghostMarker} >
                    <Text style={styles.text}>{0}</Text>
                </View>
                  {/* <MapView.Callout tooltip style={styles.test}>
                    <Button style={styles.marker} title = '💩' onPress = {()=>this.deleteLit(marker.address)} />
                    <Button style={styles.marker} title = '🔥' onPress = {()=>this.addLit(marker.address)} />
                    <Text>|</Text>
                    <Button style={styles.marker} title = 'ⓘ' onPress={this.toggleInfoPage} />
                  </MapView.Callout> */}

              </MapView.Marker>
            )
          })}
            <MapView.Marker 
              // {...this.state.ghostMarker} 
              // onPress={this.handlePress}
              // onPress =  {() => this.toggleTab(marker.address)} 
              >
                {/* <View style={styles.marker} >
                    <Text style={styles.text}>{this.state.ghostMarker.cost}</Text>
                </View> */}

                  {/* <MapView.Callout tooltip style={styles.test}>
                    <Button style={styles.marker} title = '💩' onPress = {()=>this.deleteLit(marker.address)} />
                    <Button style={styles.marker} title = '🔥' onPress = {()=>this.addLit(marker.address)} />
                    <Text>|</Text>
                    <Button style={styles.marker} title = 'ⓘ' onPress={this.toggleInfoPage} />
                  </MapView.Callout> */}

              </MapView.Marker>
          </MapView>


          <Animated.View style={{...styles.infoPage,top:this.state.animatedTop}}>
            <Button style={styles.marker} title = 'X' onPress={this.toggleInfoPage} />
            <Text style = {{...styles.locationText}}>
              Analytics
            </Text>
            <Text style = {{...styles.locationText}}>
              {this.state.infoPageMarker}
            </Text>
            <Text style = {{...styles.locationText}}>
              🔥 = {this.returnUpVotes(this.state.infoPageMarker)}
            </Text>
            <Text style = {{...styles.locationText}}>
              💩 = {this.returnDownVotes(this.state.infoPageMarker)}
            </Text>
          </Animated.View>

          <Animated.View style={{...styles.tab,left:this.state.animatedTab}}> 
            <Button style={styles.marker} title = '💩' onPress = {()=>this.deleteLit(this.state.selectedMarker)} />
            <Button style={styles.marker} title = '🔥' onPress = {()=>this.addLit(this.state.selectedMarker)} />
            <Button style={styles.marker} title = 'ⓘ' onPress={this.toggleInfoPage} />
            <Button style={styles.marker} color="red" title = 'X' onPress={()=>this.toggleTab(this.state.selectedMarker)} />
          </Animated.View>
        </View>
    );
  }
  //ADDED THIS LISTENER FOR REAL TIME UPDATES
  listener = db.collection('locations')
    // .where('latitude', '>', /*this.state.region.latitude-this.state.region.latitudeDelta*/)
    // .where('latitude', '<', this.state.region.latitude+this.state.region.latitudeDelta)
    // .where('longitude', '>', this.state.region.longitude-this.state.region.longitudeDelta)
    // .where('longitude', '<', this.state.region.longitude+this.state.region.longitudeDelta)
    .onSnapshot(snapshot => {
    let changes = snapshot.docChanges();
    changes.forEach(change => {
      if(change.type == 'added' /*&& !this.state.markerIDs.includes(change.doc.id)*/){
        console.log('added');
        let newDictionary = {...this.state.markers_};
        newDictionary[change.doc.id] = {
            coordinate: {
              latitude: change.doc.data().latitude,
              longitude: change.doc.data().longitude
            },
            cost: change.doc.data().count,
            address: change.doc.id,
            upVotes: change.doc.data().upVotes,
            downVotes: change.doc.data().downVotes
        }
        let votableMarkers_ = [...this.state.votableMarkers];
        // console.log(1)
        // console.log(change.doc.id)
        // console.log(change.doc.data().latitude, " ", change.doc.data().longitude);
        // console.log(change.doc.data().latitude < this.state.userLocation.latitude + 0.0002694933525);
        // console.log(change.doc.data().latitude > this.state.userLocation.latitude - 0.0002694933525);
        // console.log(change.doc.data().longitude < this.state.userLocation.longitude + 0.000000748596382);
        // console.log(change.doc.data().longitude > this.state.userLocation.longitude - 0.000000748596382);
        // console.log((change.doc.id == this.state.userLocation.address), "\n")
        if ((change.doc.data().latitude < this.state.userLocation.latitude + 0.0002694933525
          && change.doc.data().latitude > this.state.userLocation.latitude - 0.0002694933525
          && change.doc.data().longitude < this.state.userLocation.longitude + 0.000000748596382
          && change.doc.data().longitude > this.state.userLocation.longitude - 0.000000748596382)  || (change.doc.id == this.state.userLocation.address)) {
            if (votableMarkers_.includes(change.doc.id)) {
              votableMarkers_.push[change.doc.id];
              console.log(change.doc.id);
              console.log(1);
            }
          }
        this.setState({votableMarkers: votableMarkers_});
        this.setState({markers_: newDictionary});
      } 
      else if(change.type == 'modified'){
        console.log('modified');
        let newDictionary = {...this.state.markers_};
        newDictionary[change.doc.id].cost = change.doc.data().count;
        newDictionary[change.doc.id].upVotes = change.doc.data().upVotes;
        newDictionary[change.doc.id].downVotes = change.doc.data().downVotes;
        this.setState({markers_: newDictionary});
      }
      else if(change.type == 'removed') {
        console.log('removed');
        let newDictionary = {...this.state.markers_};
        delete newDictionary[change.doc.id];
        this.setState({markers_: newDictionary});
      }
    })
  })
}
//this.marker.hideCallout();
const styles = StyleSheet.create({

  container: {
    justifyContent: 'center',
    flex:1
  },
  findMeButton: {
    alignSelf: 'flex-start',
    position: 'absolute',
    top:0,
  },
  infoPage: {
    height: '90%',
    width: '90%',
    position: 'absolute',
    top:50,
    alignSelf:'center',
    borderColor:'black',
    borderWidth: 2,
    borderRadius: 15,
    backgroundColor: 'white',
    flex:1,
    flexDirection:'column',
    justifyContent:'flex-start',
    alignItems:'center'
  },
  touch: {
    backgroundColor: 'yellow',
    flex: 1,
    width: 100,
    height: 900
  },
  animView: {
    backgroundColor:'blue',
    flex:.5,
    borderBottomColor:'black',
    borderBottomWidth: 5,
  },
  bigContainer: {
    flex:1,
    flexDirection: 'column',
    justifyContent:'flex-start',
  },
  locationText: {
    marginTop:10,
    alignSelf: 'center',
    fontSize: 20,
  },
  marker: {
    padding: 5,
    borderRadius: 5,
    backgroundColor:"red",
    flexDirection:"column",
    justifyContent: "center"


  },
  ghostMarker: {
    padding: 5,
    borderRadius: 5,
    backgroundColor:"grey",
    flexDirection:"column",
    justifyContent: "center"


  },
  marker2: {
    backgroundColor: "green",
    borderRadius: 5,
    height:30,
    width: 60,
    // flexDirection: 'row',
    // justifyContent: 'space-between',
  },
  test: {
    flex:1,
    flexDirection:'row',
    justifyContent: 'space-evenly',
    width: 100,
    height: 40,
    alignItems: 'center',
    backgroundColor:"white",
    borderColor:'black',
    borderWidth: 2,
    borderRadius: 10
  },
  markerContainer: {
    flex:1,
    flexDirection:'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor:"red"
  },
  text: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 20
  },

  tab: {
    backgroundColor:"white",
    borderColor:'black',
    borderWidth: 2,
    borderRadius: 10,
    position: 'absolute',
    flex:1,
    left: 370,
    top: '40%',
    flexDirection:'column',
    justifyContent: 'space-evenly',
    alignItems:"center",
    width: 40,
    height: 120,
  },

  closeTab: {
    color:"red"
  },

  leaderBoardButton: {
    backgroundColor:"white",
    borderColor:'black',
    borderWidth: 2,
    borderRadius: 10,
    position: 'absolute',
    flex:1,
    left: 1,
    top: '40%',
    flexDirection:'column',
    // justifyContent: 'space-evenly',
    // alignItems:"center",
    width: 40,
    height: 40,
  }
});
