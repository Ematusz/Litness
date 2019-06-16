import React from 'react';
import { TouchableOpacity,FlatList,Animated, Text, View, Button, Image } from 'react-native';
import styles from './styles.js'
import MapView,{ Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {Constants, Location, Permissions} from 'expo';
import g from 'ngeohash'
import * as math from 'mathjs';


export default class Map extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            locationResult:null,
            error: null,
        };

        this._getLocationAsync = this._getLocationAsync.bind(this);
        this.onLongPressMap = this.onLongPressMap.bind(this);
        this.addNewLocation = this.addNewLocation.bind(this);
        this.toggleTabMapPress = this.toggleTabMapPress.bind(this);
        this.onRegionChangeComplete = this.onRegionChangeComplete.bind(this);
    }

    componentDidMount() {};
    componentWillMount() {
      this._getLocationAsync();
    };

    addNewLocation = async(latitude_, longitude_) => {
      var ghostGeohash = g.encode_int(latitude_,longitude_,26)
      var city = null;
      var street = null;
      var number = null;
      // fetch the address of the place you are passing in the coordinates of.
      myApiKey = 'AIzaSyBkwazID1O1ryFhdC6mgSR4hJY2-GdVPmE';
      fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + latitude_ + ',' + longitude_ + '&key=' + myApiKey)
          .then((response) => response.json())
          .then((responseJson) => {
            var len = JSON.parse(JSON.stringify(responseJson)).results.length
            var i = 0;
            var minDist = -1;
            // this loop checks to see which of the possible results returned from the
            // fetch is closest to the latitude and longitude click that are actually passed
            // in. This used to just take the first result, however, sometimes it is not sorted
            // in a fashion of closest so this was causing problems particularly when adding
            // markers to building with multiple sub buildings attached. For example mason,
            // Angel, or Tisch halls.
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
            // saves the data of the json result that is closest to the latitude and longitude 
            // passed into the funciton.
            let results = JSON.parse(JSON.stringify(responseJson)).results[i]
            let address_ = results.formatted_address;
            let coords = results.geometry.location;
            len = results.address_components.length;
            var l = null;
            for (j = 0; j < len; j++) {
              l = results.address_components[j].types.length;
              for (k = 0; k < l; k++) {
                if (results.address_components[j].types[k] == "locality") {
                  city = results.address_components[j].long_name;
                }
                if (results.address_components[j].types[k] == "route") {
                  street = results.address_components[j].short_name;
                }
                if (results.address_components[j].types[k] == "street_number") {
                  number = results.address_components[j].long_name;
                }
              }
            }
            // console.log(city);
            // console.log(JSON.parse(JSON.stringify(responseJson)).results[i]);
            // checks to see if the users last known location is close enough to the hub to vote
            // on it
            let userLocation = this.props.userLocation;
            if ((coords.lat < userLocation.latitude + 0.02694933525
              && coords.lat > userLocation.latitude - 0.02694933525
              && coords.lng < userLocation.longitude + 0.0000748596382
              && coords.lng > userLocation.longitude - 0.0000748596382)
              || (address_ == userLocation.address)) {
              // console.log(true);
            } else {
              // console.log(false);
            }
  
            // checks to make sure that the new location is not already part of the markers
            // dictionary. This would mean that the marker is already in the database. May need 
            // to query the actual database though instead... Look into this.
            if (this.props.geoHashGrid[ghostGeohash] == undefined || !Object.keys(this.props.geoHashGrid[ghostGeohash]).includes(address_)) {
              // creates the new ghost marker with the information of this location.
              // console.log('here')
              let newGhostMarker = [];
              newGhostMarker.push({
                  coordinate: {
                    latitude: coords.lat,
                    longitude: coords.lng
                  },
                  address: address_,
                  geohash: ghostGeohash,
                  city: city,
                  street: street,
                  number: number,
                  key: Math.random()                    
                });
                console.log(newGhostMarker[0])
                this.props.showVotingButtonsHandler(true)

              this.props.tabValHandler()

              this.props.selectedMarkerHandler(address_)

              this.props.selectedGeohashHandler(ghostGeohash)

              this.props.ghostMarkerHandler(newGhostMarker)
            }
          })
      }

    onLongPressMap = info => {
      if (!this.props.selectedMarker) {
        let data = info.nativeEvent.coordinate
        let userLocation = this.props.userLocation
        let dist = math.sqrt(math.square(data.latitude - userLocation.latitude)+math.square(data.longitude - userLocation.longitude));
        if (dist < 0.0003) {
          this.addNewLocation(data.latitude, data.longitude); 
          
        }
      }
    }

    _getLocationAsync = async() => {
      let{ status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status !== 'granted') {
        this.setState({
          locationResult:'Permission to access location was deinied',
        });
      }
  
      let location = await Location.getCurrentPositionAsync({enableHighAccuracy: false});
      this.setState({locationResult:JSON.stringify(location)});
  
      var initialRegion = {
        latitude: JSON.parse(this.state.locationResult).coords.latitude,
        longitude: JSON.parse(this.state.locationResult).coords.longitude,
        latitudeDelta: 0.0005,
        longitudeDelta: 0.0005,
      }
  
      this.props.mapRegionHandler(initialRegion)
      // this.setState({mapRegion: initialRegion})
      var currentGeohash = [g.encode_int(initialRegion.latitude,initialRegion.longitude,26)];
      var currentGrid = g.neighbors_int(currentGeohash[0],26);
      currentGrid = currentGeohash.concat(currentGrid);

      this.props.currentGridHandler(currentGrid)
  
      this.map.animateToRegion(initialRegion, 1);

      this.props.mapRegionHandler(initialRegion)
    };

     toggleTabMapPress = pressinfo => {
      if(pressinfo.nativeEvent.action !== "marker-press") {
        this.props.hideTab();
      }
    }

    onRegionChangeComplete = mapRegion => {
      var currentGeohash = [g.encode_int(mapRegion.latitude,mapRegion.longitude,26)];
      var currentGrid = g.neighbors_int(currentGeohash[0],26);
      currentGrid = currentGeohash.concat(currentGrid);
      let cleanGrid = null;
      Object.keys(this.props.geoHashGrid).map( geohash => {
        if (!currentGrid.includes(Number(geohash))) {
          if (cleanGrid === null) {
            cleanGrid = {...this.props.geoHashGrid};
          }
          delete cleanGrid[geohash];
        }
      })
      if (cleanGrid !== null) {
        this.props.geoHashGridHandler(cleanGrid);
      }
    }

    render() {
        return (
        <MapView
            // create the map with the map settings
            ref={ref => {this.map = ref;}}  
            minZoomLevel = {16.5}
            maxZoomLevel = {19}
            showsMyLocationButton = {true}          
            zoomEnabled = {true}
            provider = {PROVIDER_GOOGLE}
            showsUserLocation = {true}
            onLongPress = {this.onLongPressMap}
            onPress = {this.toggleTabMapPress}
            onRegionChangeComplete = {this.onRegionChangeComplete}
            style={styles.container}
            initialRegion = {{
                latitude:37.7884459,
                longitude:-122.4066252,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }}
            > 
            {Object.values(this.props.geoHashGrid).map(markerSet => {
                return(
                Object.values(markerSet).map( (marker) => {
                // creates each marker in the primary markers_ dictionary.
                    return (
                    <MapView.Marker 
                    {...marker} 
                    // on press should toggle the voter tab
                    onPress = {() => this.props.toggleTab(marker.address,marker.geohash)} 
                    >
                        <View style={{...styles.marker,borderColor:marker.borderColor}} >
                            {this.props.renderImage(marker.cost)}
                            <Text style={styles.testtext}>{marker.cost}</Text>
                        </View>
        
                    </MapView.Marker>
                    )
                })
                )
            })}
            {this.props.ghostMarker.map( (marker) => {
                // creates the ghostMarker if needed.
                return (
                <MapView.Marker 
                {...marker} 
                // on press should toggle the voter tab. This should only be relevant if pressing
                // to close the tab
                onPress =  {() => this.props.toggleTab(marker.address,marker.geohash)} 
                >
                    <View style={styles.ghostMarker} >
                    <Image
                        style = {styles.emojiIcon}
                        source={require('./assets/poo2.png')}
                    />
                    <Text style={styles.testtext}>?</Text>
                    </View>

                </MapView.Marker>
                )
            })}
        </MapView>
        );
    }
}