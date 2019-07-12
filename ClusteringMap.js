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
          error: null,
          dragging: false,
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
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.pressMarker = this.pressMarker.bind(this);
    }

    pressMarker(marker) {
      this.state.markerToRef[marker.address].showCallout();
      this.props.openTab(marker);
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

    componentDidUpdate(prevProps, prevState, snapshot) {
      if (prevProps.moveToLocation != this.props.moveToLocation ) {
        this.map.getMapRef().animateToRegion(this.props.moveToLocation.coordinates,1);
        setTimeout(() => {
          this.state.markerToRef[this.props.moveToLocation.address].showCallout();
        }, 5000);
      } 
    }

    renderCluster = (cluster, onPress) => {
      const pointCount = cluster.pointCount,
            coordinate = cluster.coordinate,
            clusterId = cluster.clusterId
  
      return (
        <Marker identifier={`cluster-${clusterId}`} coordinate={coordinate} onPress={onPress}>
          <View style={{...styles.marker,width:40,height:40, backgroundColor:"white",borderWidth:2, borderColor:"black"}}>
            <Text style={{...styles.markerCost,color:"black"}}>
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
            // on press should toggle the voter tab. This will happen on close
            onPress =  {() => this.props.openTab(marker.address,marker.geohash)}
            // onPress =  {() => this.props.toggleTab(marker.address,marker.geohash)}
            onDragStart = { () => {
              // console.log(this.markerRef)
              this.setState({dragging: true})
              this.markerRef.hideCallout()
              this.props.closeTab(false)
            }}
            // onRegionChangeComplete getting called here. Not quite sure why
            onDragEnd = { (e) => {
              this.setState({dragging: false})
              this.props.setGhost(e.nativeEvent.coordinate.latitude,e.nativeEvent.coordinate.longitude)
            }}
            title = {marker.number + " " + marker.street + "\nDrag me!"} 
            // title = {"hello"}
            >
                <View style={styles.ghostMarker} >
                <Image
                    style = {styles.emojiIcon}
                    source={require('./assets/poo2.png')}
                />
                <Text style={styles.markerCost}>?</Text>
                </View>

          </MapView.Marker>
        )
      } else {
        return (
          <MapView.Marker 
            {...marker} 
            // on press should toggle the voter tab
            onPress = {() => this.pressMarker(marker)} 
            title = {marker.number + " " + marker.street}
            ref={(ref) => this.state.markerToRef[marker.address] = ref}
            zIndex = {0}
          >
            {!this.props.switchValue && <View style={{...styles.marker}} >
                {!this.props.switchValue && this.props.renderImage(marker.cost)}
                <Text style={styles.markerCost}>{marker.cost}</Text>
            </View>}
  
            {this.props.switchValue && <View style={{...styles.markerHeatMap,backgroundColor: color,shadowColor:color}}/>}
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
      if(pressinfo.nativeEvent.action !== "marker-press") {
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