import React from 'react';
import { TouchableOpacity,FlatList,Animated, StyleSheet,Text, View, Button, Image,SafeAreaView} from 'react-native';
import styles from './styles.js'
import MapView,{ Marker, PROVIDER_GOOGLE,Callout } from 'react-native-maps';
import ClusteredMapView from 'react-native-maps-super-cluster';
import {Constants, Location, Permissions,LinearGradient} from 'expo';
import g from 'ngeohash'
import * as math from 'mathjs';

export default class ClusteringMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            locationResult:null,
            error: null,
            pins: [],
            interaction: true,
        };

        this._getLocationAsync = this._getLocationAsync.bind(this);
        this.onLongPressMap = this.onLongPressMap.bind(this);
        this.addNewLocation = this.addNewLocation.bind(this);
        this.toggleTabMapPress = this.toggleTabMapPress.bind(this);
        this.onRegionChangeComplete = this.onRegionChangeComplete.bind(this);
        this.renderMarker = this.renderMarker.bind(this)
        this.renderCluster = this.renderCluster.bind(this)
    }

    componentDidMount() {
      this.props.onRef(this);
    };
    componentWillMount() {
      this._getLocationAsync();
    };
    componentWillUnmount() {
      this.props.onRef(undefined)
    }

    renderCluster = (cluster, onPress) => {
      const pointCount = cluster.pointCount,
            coordinate = cluster.coordinate,
            clusterId = cluster.clusterId
  
      return (
        <Marker identifier={`cluster-${clusterId}`} coordinate={coordinate} onPress={onPress}>
          <View style={{...styles.marker,width:40,height:40, backgroundColor:"white",borderWidth:2, borderColor:"black"}}>
            <Text style={styles.testtext}>
              {pointCount}
            </Text>
          </View>
        </Marker>
      )
    }

    renderMarker = (marker) => {
      let points = marker.cost * 5;
      let red = points;
      let blue = 255 - points;
      let color = 'rgba(' + red.toString() +',0,'+ blue.toString()+',.35)';
      if (marker.ghostMarker) {
        return (
          <MapView.Marker
            {...marker} 
            // ref = {marker=> {
            //   this.marker = marker;
            //   // marker.showCallout();
            // }}
            draggable
            zIndex={10}
            showCallout
            cluster = {false}
            // on press should toggle the voter tab. This will happen on close
            onPress =  {() => this.props.openTab(marker.address,marker.geohash)}
            // onPress =  {() => this.props.toggleTab(marker.address,marker.geohash)}
            onDragStart = { () => this.props.closeTab(false)}
            // onRegionChangeComplete getting called here. Not quite sure why
            onDragEnd = { (e) => {this.props.setGhost(e.nativeEvent.coordinate.latitude,e.nativeEvent.coordinate.longitude); console.log("dragend")}}
            // title = {marker.number + " " + marker.street} 
            title = {"hello"}
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
      } else {
        return (
          <MapView.Marker 
            {...marker} 
            // on press should toggle the voter tab
            onPress = {() => this.props.openTab(marker.address,marker.geohash)} 
            // onPress = {() => this.props.toggleTab(marker.address,marker.geohash)} 
            title = {marker.number + " " + marker.street}
            zIndex = {0}
          >
            {!this.props.switchValue && <View style={{...styles.marker,borderColor:marker.borderColor}} >
                {!this.props.switchValue && this.props.renderImage(marker.cost)}
                <Text style={styles.testtext}>{marker.cost}</Text>
            </View>}
  
            {this.props.switchValue && <View style={{...styles.markerHeatMap,backgroundColor: color,shadowColor:color}}/>}
          
          </MapView.Marker>
        )
      }
    }

        // Initializes the ghost marker to closest location in possible current locations

    // may be depreciated soon
    addNewLocation = async(latitude_, longitude_) => {
      let ghostGeohash = g.encode_int(latitude_,longitude_,26)
      let city = null;
      let street = null;
      let number = null;
      // fetch the address of the place you are passing in the coordinates of.
      myApiKey = 'AIzaSyBkwazID1O1ryFhdC6mgSR4hJY2-GdVPmE';
      fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + latitude_ + ',' + longitude_ + '&key=' + myApiKey)
          .then((response) => response.json())
          .then((responseJson) => {
            var len = JSON.parse(JSON.stringify(responseJson)).results.length
            var i = 0;
            var minDist = -1;

            // Chooses the fetched result that is closest to where the user actually clicked the map
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
            let results = JSON.parse(JSON.stringify(responseJson)).results[i]
            // console.log("results ", results)
            let address_ = results.formatted_address;
            let coords = results.geometry.location;
            len = results.address_components.length;
            var l = null;
            for (j = 0; j < len; j++) {
              l = results.address_components[j].types.length;
              for (k = 0; k < l; k++) {
                if (results.address_components[j].types[k] == "locality") {
                  // might need to change this to neighborhood work on tuning
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
  
            // Checks that this location has not already been added as a hub
            if (this.props.geoHashGrid[ghostGeohash] == undefined || !Object.keys(this.props.geoHashGrid[ghostGeohash]).includes(address_)) {
              // creates the new ghost marker with the information of this location.
              let newGhostMarker = [];
              newGhostMarker.push({
                  coordinate: {
                    latitude: coords.lat,
                    longitude: coords.lng
                  },
                  location: {
                    latitude: coords.lat,
                    longitude: coords.lng
                  },
                  address: address_,
                  geohash: ghostGeohash,
                  city: city,
                  street: street,
                  number: number,
                  ghostMarker: true,
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
      var currentGeohash = [g.encode_int(initialRegion.latitude,initialRegion.longitude,26)];
      var currentGrid = g.neighbors_int(currentGeohash[0],26);
      currentGrid = currentGeohash.concat(currentGrid);

      this.props.currentGridHandler(currentGrid)
  
      this.map.getMapRef().animateToRegion(initialRegion,1);

      this.props.mapRegionHandler(initialRegion)
    };

     toggleTabMapPress = pressinfo => {
       console.log("pressed")
      if(pressinfo.nativeEvent.action !== "marker-press") {
        // this.props.hideTab();
        this.props.closeTab(true);
        this.setState({interaction:true})
      } else {
        this.setState({interaction:false})
      }
    }

    onRegionChangeComplete = mapRegion => {

      var currentGeohash = [g.encode_int(mapRegion.latitude,mapRegion.longitude,26)];
      var currentGrid = g.neighbors_int(currentGeohash[0],26);
      currentGrid = currentGeohash.concat(currentGrid);
      this.props.currentGridHandler(currentGrid);
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
          <ClusteredMapView
          style={{flex: 1}}
          ref={ref => {this.map = ref;}} 
            clusteringEnabled={this.props.clustering} 
            minZoomLevel = {12}
            maxZoomLevel = {19}
            showsMyLocationButton = {true}          
            zoomEnabled = {true}
            provider = {PROVIDER_GOOGLE}
            showsUserLocation = {true}
            pitchEnabled={this.state.interaction}
            scrollEnabled={this.state.interaction}
            rotateEnabled={this.state.interaction}
            zoomControlEnabled={this.state.interaction}
            zoomTapEnabled={this.state.interaction}
            zoomEnabled={this.state.interaction}
            showsBuildings = {true}
            loadingEnabled={true}
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
          data={Object.values(this.props.geoHashGrid).map(x => Object.values(x)).map(x=>x).flat().concat(this.props.ghostMarker)}
          renderMarker={this.renderMarker}
          renderCluster={this.renderCluster}
          >
          </ClusteredMapView>
        );
    }
}