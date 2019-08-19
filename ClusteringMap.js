import React from 'react';
import {Text, View} from 'react-native';
import styles from './styles.js'
import MapView,{ Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import ClusteredMapView from 'react-native-maps-super-cluster';
import {renderMarkerIcon, renderGhostIcon} from './renderImage.js'
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { SplashScreen } from 'expo';
import { NetInfo } from 'react-native';

export default class ClusteringMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          dragging: false,
          error: null,
          interaction: true,
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
    }

    pressMarker(marker) {
      if (this.props.userLocation.userAddressDictionary != undefined) {
        this.state.markerToRef[marker.location.address].showCallout();
        this.props.openTab(marker);
      } else {
        this.props.bannerErrorHandler({state: true, message: "Give us a second while we finish loading your location..."});
      }
    }

    componentDidMount() {
      this.props.onRef(this);
    };
    componentWillMount() {
      setTimeout(()=>this.setState({flex: 1}, console.log("flex1",this.state.flex)), 500);
      NetInfo.getConnectionInfo().then( connectionInfo => {
        console.log(connectionInfo)
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
      if (locationObj.address) {
        setTimeout(() => {
          this.state.markerToRef[locationObj.address].showCallout();
        }, 500);
      }
    }

    renderCluster = (cluster, onPress) => {
      const pointCount = cluster.pointCount,
            coordinate = cluster.coordinate,
            clusterId = cluster.clusterId
  
      return (
        <Marker identifier={`cluster-${clusterId}`} coordinate={coordinate} onPress={onPress}>
          <View style={{...styles.marker,width:40,height:40, backgroundColor:"black",borderWidth:2, borderColor:"white"}}>
            <Text style={{...styles.markerCost,color:"white"}}>
              {pointCount}
            </Text>
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
            onPress =  {() => this.props.openTab(marker)}
            onDragStart = { () => {
              this.setState({dragging: true})
              this.markerRef.hideCallout()
              this.props.closeTab(false)
            }}
            onDragEnd = { (e) => {
              this.setState({dragging: false})
              this.props.setGhost(e.nativeEvent.coordinate.latitude,e.nativeEvent.coordinate.longitude)
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
            <View style={{...styles.marker, backgroundColor: "red", width: 20, height: 20}} />
          </MapView.Marker>
        )
      }
    }

    // Initializes the ghost marker to closest location in possible current locations
    _getLocationAsync = async() => {
      let{ status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status !== 'granted') {
        this.setState({
          locationResult:'Permission to access location was deinied',
        });
      }
  
      let location = await Location.getCurrentPositionAsync({enableHighAccuracy: false});
      this.setState({locationResult:JSON.stringify(location)});
  
      let initialRegion = {
        latitude: JSON.parse(this.state.locationResult).coords.latitude,
        longitude: JSON.parse(this.state.locationResult).coords.longitude,
        latitudeDelta: 0.0005,
        longitudeDelta: 0.0005,
      }
  
      this.props.mapRegionHandler(initialRegion);
      this.map.getMapRef().animateToRegion(initialRegion,1);
      SplashScreen.hide();
    };

    toggleTabMapPress = pressinfo => {
      if(pressinfo.nativeEvent.action !== "marker-press") {
        this.props.closeTab(true);
      }
    }

    onRegionChangeComplete = mapRegion => {
      this.props.mapRegionHandler(mapRegion);
      // console.log("longitude", mapRegion.longitude)
      this.props.addListenerHandler(mapRegion.latitude,mapRegion.longitude);
    }

    render() {
        return (
          <ClusteredMapView
          style={{flex: 1}}
          ref={ref => {this.map = ref;}} 
            clusteringEnabled={this.props.clustering} 
            minZoomLevel = {14}
            maxZoomLevel = {19}
            showsMyLocationButton = {false}          
            zoomEnabled = {true}
            provider = {PROVIDER_GOOGLE}
            showsUserLocation = {true}
            showsBuildings = {true}
            loadingEnabled={true}
            onPress = {this.toggleTabMapPress}
            onRegionChangeComplete = {this.onRegionChangeComplete}
            style={styles.container}
            initialRegion = {{
                latitude:37.7884459,
                longitude:-122.4066252,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }}
          // data={Object.values(this.props.geoHashGrid).map(x => Object.values(x)).map(x=>x).flat().concat(this.props.ghostMarker)}
          data = {Object.values(this.props.hubs).map(x => x).flat().concat(this.props.ghostMarker).concat(this.props.possibleLocationMarker)}
          renderMarker={this.renderMarker}
          renderCluster={this.renderCluster}
          />
        );
    }
}