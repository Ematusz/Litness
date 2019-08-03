import React from 'react';
import Hub from './Hub.js'
import {TouchableOpacity,View, ActivityIndicator,Text, FlatList} from 'react-native';
import styles from './styles.js'
import {renderMarkerIcon, renderLoadingFire, renderRefresh} from './renderImage.js'
import { getDistance } from 'geolib';
import * as math from 'mathjs';

export default class Leaderboard extends React.Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
          processedData:[],
          refreshing: true,
          showLeaderboard: false,
          selectedIndex: 0,
          state: null,
          city: null,
        }

        this.renderLeaderboardCell = this.renderLeaderboardCell.bind(this);
        this.getData = this.getData.bind(this);
        this.refresh = this.refresh.bind(this);
        this.updateIndex = this.updateIndex.bind(this);
        this.distanceFromUser = this.distanceFromUser.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this._isMounted = false;

    }

    updateIndex (selectedIndex) {
      this.setState({selectedIndex})
  }

    componentWillMount() {
      this._isMounted = true;
      setTimeout(() => {
        this._isMounted && this.getData();            
          }, 1000);
    };
    // componentWillMount() {};

    componentWillUnmount() {
      this._isMounted = false;
    };

    refresh() {
      this.setState({refreshing:true});
      this.getData()
    }

    getData() {
      myApiKey = 'AIzaSyBkwazID1O1ryFhdC6mgSR4hJY2-GdVPmE';
      fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + this.props.mapRegion.latitude + ',' + this.props.mapRegion.longitude + '&key=' + myApiKey)
      .then((response) => response.json())
      .then((responseJson) => { 
        let results = JSON.parse(JSON.stringify(responseJson)).results
        let state = null;
        let city = null;
        results[0].address_components.forEach( component => {
          component.types.forEach( type => {
            if (type == "administrative_area_level_1") {
              state = component.short_name;
              this._isMounted && this.setState({state});
            }
            if (type == "locality") {
              // might need to change this to neighborhood work on tuning
              city = component.long_name;
              this._isMounted && this.setState({city});
            }
          })
        })
        let data = [];
       db.collection('leaderboard').where("city", "==", city).where("state", "==", state).orderBy('count', 'desc').limit(25).get()
          .then( leaderBoardSnapshot => {
            let counter = 1;
            leaderBoardSnapshot.forEach( leaderBoardHub => {
              hubs.doc(leaderBoardHub.id).get().then( doc => {
                let hub = new Hub(
                  {
                    latitude: doc.data().latitude,
                    longitude: doc.data().longitude
                  },
                  {
                    latitude: doc.data().latitude,
                    longitude: doc.data().longitude,
                    address: doc.id,
                    city: doc.data().city,
                    street: doc.data().street,
                    number: doc.data().number,
                  },
                  false,
                  doc.data().geohash[0],
                  {
                    cost: doc.data().count,
                    upVotes: doc.data().upVotes,
                    downVotes: doc.data().downVotes,
                  },
                  doc.id,
                )
                data.push({hub:hub,key:counter.toString()});
                counter = counter + 1;
                this._isMounted && this.setState({ processedData: data },()=>this.setState({ showLeaderboard: true,refreshing:false }));
              }).catch( error => {console.log(error)});
            })
          }).catch( error =>{
            console.log(error)
          })
        })
    }

    distanceFromUser(hub) {
      let distance = math.round(getDistance({latitude: this.props.userLocation.latitude,longitude: this.props.userLocation.longitude},
          {latitude: hub.coordinate.latitude,longitude: hub.coordinate.longitude})*3.28084);
      if (distance <= 1000) {
        return distance.toString().concat(" ft");
      } else {
        distance = distance/5280
        return distance.toFixed(1).concat(" mi");
      }
    }

    renderLeaderboardCell =  ({item}) => {
      console.log("hub", item.hub)
      return (
        <TouchableOpacity style = {styles.leaderBoardCell} onPress={()=>this.props.toggleInfoPage(item.hub)}>
          <Text style = {{...styles.leaderboardText,fontWeight:'bold',color:"black"}}> {item.key} </Text>
              {renderMarkerIcon(item.hub.stats.cost)}
          <View style = {{display:'flex', flexDirection:'column'}}>
            <Text style = {styles.leaderboardText}> {item.hub.location.number} {item.hub.location.street} </Text>
            <Text style = {{...styles.leaderboardText, fontSize: 12, color:'grey'}}> {this.distanceFromUser(item.hub)} </Text>
          </View>
  
          <View style = {styles.LBinnerBox}>
            <Text style = {{color:'black',fontSize:20, fontWeight:'bold'}}>{item.hub.stats.cost}</Text>
          </View>
        </TouchableOpacity>
      )
    }
  
    renderSeparator = () => {
      return (
        <View
          style={{
            height: 1,
            width: "100%",
            backgroundColor: "#CED0CE",
            alignSelf: "center"
          }}
        />
      );
    };
  
    render() {
      return (
        <View style={[styles.leaderboard,this.props.style]}>
            <TouchableOpacity onPress={this.props.toggleLeaderBoard} style = {styles.closeBar}>
              <Text style = {{color:'white',fontWeight:'bold'}}>X</Text>
            </TouchableOpacity>
  
            <TouchableOpacity onPress={this.refresh} style={styles.refresh}>
                {renderRefresh()}
            </TouchableOpacity>
  
            <Text style = {{...styles.locationText, fontSize: 30, fontWeight:'bold'}}>
              Leaderboard
            </Text>

            {this.state.showLeaderboard && <Text style={{...styles.locationText, fontSize: 20}}>
                {this.state.city + ", " + this.state.state}
            </Text>}
  
            {!this.state.showLeaderboard && <View style={{position:'absolute',top:'50%', display: "flex", flexDirection:"column", justifyContent:"flex-start",alignItems:"center"}}>
                {renderLoadingFire()}
                <Text style ={{color:"black", fontSize: 17}}> Loading... </Text>
            </View>}
  
            {this.state.showLeaderboard && <FlatList
            ItemSeparatorComponent={this.renderSeparator}
            data = {this.state.processedData}
            renderItem = {this.renderLeaderboardCell}
            style={styles.flatListContainer}
            onRefresh={this.refresh}
            refreshing={this.state.refreshing}
            />}
            
            {this.state.refreshing && <View style ={styles.loading}>
                <ActivityIndicator size="small" color="white" />
            </View>}
        </View>
      );
    }
  }