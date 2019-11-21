import React from 'react';
import {Text, View, Image} from 'react-native';
import styles from './styles.js'
import MapView,{ Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import ClusteredMapView from 'react-native-maps-super-cluster';
import {renderMarkerIcon, renderGhostIcon, renderClusterMarker, renderPlusSign} from './renderImage.js'
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { SplashScreen } from 'expo';
import { NetInfo } from 'react-native';

export default class ClusteringMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          data:[],
          dragging: false,
          error: null,
          interaction: true,
          initialRegion: null,
          locationResult:null,
          markerToRef: {},
          pins: [],
        };

        this._getLocationAsync = this._getLocationAsync.bind(this);
        this.toggleTabMapPress = this.toggleTabMapPress.bind(this);
        this.onRegionChangeComplete = this.onRegionChangeComplete.bind(this);
        this.renderMarker = this.renderMarker.bind(this)
        this.renderCluster = this.renderCluster.bind(this)
        this.pressMarker = this.pressMarker.bind(this);
        this.animateToSpecificMarker = this.animateToSpecificMarker.bind(this);
        this.handleConnectionChange = this.handleConnectionChange.bind(this);
        this.initializeRegion = this.initializeRegion.bind(this);
    }

    pressMarker(marker) {
      if (this.props.userLocation.longitude != undefined) {
        if (marker.location.address in this.state.markerToRef) {
          this.state.markerToRef[marker.location.address].showCallout();
          this.props.getAddress(this.props.userLocation.latitude,this.props.userLocation.longitude,marker);
        }
      } else {
        this.props.bannerErrorHandler({state: true, message: "Give us a second while we finish loading your location..."});
      }
    }

    componentDidMount() {
      this.props.onRef(this);
    };
    componentWillMount() {
      NetInfo.getConnectionInfo().then( connectionInfo => {
        console.log("connectionInfo",connectionInfo)
        if (connectionInfo.type != "none") {
          NetInfo.addEventListener('connectionChange', this.handleConnectionChange)
          this._getLocationAsync();          
        } else {
          this.props.pageErrorHandler({state: true, message: "Oops! We can't seem to reach our servers. Please check your connection and try again."});
        }
      })
    };
    componentWillUnmount() {
      this.props.onRef(undefined)
    }

    handleConnectionChange(connectionInfo) {
      this.props.connectionTypeHandler(connectionInfo);
      if (connectionInfo.type == "none") {
        this.props.removeWatchPosition
        this.props.bannerErrorHandler({state:"locked", message: "Oops! It seems like you've gone offline. Check your connection so we can get you updated information about the area around you!"})
      } else {
        this.props.bannerErrorHandler({state: false, message: null})
        this.props.addWatchPosition();
      }
    }

    animateToSpecificMarker(locationObj) {
      this.map.getMapRef().animateToRegion(locationObj.coordinates,1);
      setTimeout(() => {
        if (this.state.markerToRef[locationObj.address] != undefined) {
          this.state.markerToRef[locationObj.address].showCallout();
        } else {
          setTimeout(() => {
            if (this.state.markerToRef[locationObj.address] != undefined) {
              this.state.markerToRef[locationObj.address].showCallout();
            }
          }, 1500)
        }
      }, 500);
    }

    renderCluster = (cluster, onPress) => {
      const pointCount = cluster.pointCount,
            coordinate = cluster.coordinate,
            clusterId = cluster.clusterId
  
      return (
        <Marker identifier={`cluster-${clusterId}`} coordinate={coordinate} onPress={onPress}>
          <View style={{...styles.marker}}>
            {renderClusterMarker()}
            <Text style={styles.markerCost}>{pointCount}</Text>
          </View>
        </Marker>
      )
    }

    renderMarker = (marker) => {
      if (marker.ghostMarker === true) {
        return (
          <MapView.Marker
            {...marker} 
            ref = {markerRef=> {
              this.markerRef = markerRef;
              if (markerRef != null && !this.state.dragging) {
                markerRef.showCallout();
              }
              
            }}
            draggable
            zIndex={10}
            showCallout
            cluster = {false}
            onPress =  {() => this.pressMarker(marker)}
            onDragStart = { () => {
              this.setState({dragging: true})
              this.markerRef.hideCallout()
              this.props.closeTab(false)
            }}
            onDragEnd = { (e) => {
              this.setState({dragging: false})
              this.props.getAddress(e.nativeEvent.coordinate.latitude,e.nativeEvent.coordinate.longitude,null)
            }}
            title = {marker.location.number + " " + marker.location.street + "\nDrag me!"} 
            >
                <View style={styles.ghostMarker} >
                  {renderGhostIcon()}
                  <Text style={styles.markerCost}>?</Text>
                </View>
          </MapView.Marker>
        )
      } else if (marker.ghostMarker === false)  {
        return (
          <MapView.Marker 
            {...marker} 
            // on press should toggle the voter tab
            onPress = {() => this.pressMarker(marker)} 
            title = {marker.location.number + " " + marker.location.street}
            ref={(ref) => this.state.markerToRef[marker.location.address] = ref}
            zIndex = {5}
          >
             <View style={{...styles.marker}} >
               {renderMarkerIcon(marker.stats.cost)}
              <Text style={styles.markerCost}>{marker.stats.cost}</Text>
            </View>
          </MapView.Marker>
        )
      } else {
        return (
          <MapView.Marker 
            {...marker} 
            zIndex = {0}
          >
            {renderPlusSign()}
            {/* <View style={{...styles.marker, backgroundColor: "red", width: 20, height: 20}} /> */}
          </MapView.Marker>
        )
      }
    }

    initializeRegion(region) {

      let locationResult = JSON.stringify(region);
      this.setState({locationResult});
  
      let initialRegion = {
        latitude: JSON.parse(locationResult).coords.latitude,
        longitude: JSON.parse(locationResult).coords.longitude,
        latitudeDelta: 0.0005,
        longitudeDelta: 0.0005,
      }

      this.props.mapRegionHandler(initialRegion);

      // this.map.getMapRef().animateToRegion(initialRegion,1);
      setTimeout(() => {
        // console.log(this.map.getMapRef());
        this.setState({initialRegion:initialRegion}/*,SplashScreen.hide()*/)
        // this.map.getMapRef().animateToRegion(initialRegion,1000);
        console.log(initialRegion);
      }, 500);
    }

    _getLocationAsync = async() => {
      let{ status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status !== 'granted') {
        this.setState({
          locationResult:'Permission to access location was deinied',
        });
      }
  
      this.initializeRegion(await Location.getCurrentPositionAsync({maximumAge: 0}));
    };

    toggleTabMapPress = pressinfo => {
      if(pressinfo.nativeEvent.action !== "marker-press") {
        this.props.closeTab(true);
      }
    }

    onRegionChangeComplete = mapRegion => {
      this.props.mapRegionHandler(mapRegion);
      this.props.addListenerHandler(mapRegion);
    }

    render() {
        return (
          <View style = {{flex: 1}}>
            {this.state.initialRegion != null && <ClusteredMapView
              ref={ref => {this.map = ref;}} 
                customMapStyle = {[
                  {
                    "featureType": "road.arterial",
                    "elementType": "labels",
                    "stylers": [
                      {
                        "visibility": "off"
                      }
                    ]
                  },
                  {
                    "featureType": "road.highway",
                    "elementType": "labels",
                    "stylers": [
                      {
                        "visibility": "off"
                      }
                    ]
                  },
                ]}
                clusteringEnabled={this.props.clustering} 
                minZoomLevel = {7}
                maxZoomLevel = {19}
                showsTraffic = {false}
                showsMyLocationButton = {false}          
                zoomEnabled = {true}
                provider = {PROVIDER_GOOGLE}
                showsUserLocation = {true}
                showsBuildings = {true}
                loadingEnabled={true}
                onPress = {this.toggleTabMapPress}
                onRegionChangeComplete = {this.onRegionChangeComplete}
                style={styles.container}
                initialRegion = {this.state.initialRegion}
                data = {Object.values(this.props.hubs).map(x => x).flat().concat(this.props.ghostMarker).concat(this.props.possibleLocationMarker)}
                renderMarker={this.renderMarker}
                renderCluster={this.renderCluster}
              />}
          </View>
        );
    }
}