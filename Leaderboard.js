import React from 'react';
import Hub from './Hub.js'
import {TouchableOpacity,View, ActivityIndicator,Text, FlatList} from 'react-native';
import styles from './styles.js'
import {renderMarkerIcon, renderLoadingFire, renderRefresh, renderSearch} from './renderImage.js'
import { getDistance } from 'geolib';
import * as math from 'mathjs';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Dimensions from 'Dimensions';

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
          cityType: null,
          searching: false,
        }

        this.renderLeaderboardCell = this.renderLeaderboardCell.bind(this);
        this.clearSearch = this.clearSearch.bind(this);
        this.getData = this.getData.bind(this);
        this.refresh = this.refresh.bind(this);
        this.updateIndex = this.updateIndex.bind(this);
        this.distanceFromUser = this.distanceFromUser.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.initiateSearch = this.initiateSearch.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.queryDB = this.queryDB.bind(this);
        this._isMounted = false;

    }

    updateIndex (selectedIndex) {
      this.setState({selectedIndex})
  }

    initiateSearch() {
      if(!this.state.searching) {
        this.setState({searching: true});
      }
    }

    handleSearch(data) {
      this.setState({city: data.terms[0].value})
      this.setState({state: data.terms[1].value});
      this.setState({searching: false});
      this.setState({cityType: data.types[0]})

      this.queryDB(data.terms[0].value,data.types[0],data.terms[1].value)

    }

    clearSearch() {
      console.log("clear search")
      this.setState({searching: false});
    }

    queryDB(city,cityType, state) {
      let data = [];
      db.collection('leaderboard').where(cityType, "==", city).where("state", "==", state).orderBy('count', 'desc').limit(25).get()
         .then( leaderBoardSnapshot => {
           
           let counter = 1;
           if (leaderBoardSnapshot.empty) {
             this._isMounted && this.setState({ processedData: data },()=>this.setState({ showLeaderboard: true,refreshing:false }));
           }
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
                   loclaity: doc.data().locality,
                   administrative_area_level_3: doc.administrative_area_level_3,
                   neighborhood: doc.data().neighborhood,
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
    }

    componentWillMount() {
      this._isMounted = true;
      setTimeout(() => {
        this._isMounted && this.getData();            
          }, 1000);
    };

    componentWillUnmount() {
      this._isMounted = false;
    };

    refresh() {
      this.setState({refreshing:true});
      this.queryDB(this.state.city,this.state.cityType,this.state.state)
    }

    getData() {
      
      let timeout = setTimeout(()=>{
        if (this.props.bannerErrorState != "locked") {
          this.props.bannerErrorHandler({state: true, message: "We are having trouble reaching our servers. Please check your connection and try again."})
        }
  
      },10000)
      myApiKey = apiKey;
      fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + this.props.mapRegion.latitude + ',' + this.props.mapRegion.longitude + '&key=' + myApiKey)
      .then((response) => response.json())
      .then((responseJson) => {
        clearTimeout(timeout)
        let status = JSON.parse(JSON.stringify(responseJson)).status;
        console.log(status);
        if (this.state.bannerErrorState != "locked") {
          if (status == "ZERO_RESULTS") {
            this.props.bannerErrorHandler({state: true, message: "We're having trouble figuring out which city youre in. Check your connection and try again or search a different city."})
          } else if (status == "OK") {
            this.props.bannerErrorHandler({state: false, message: null});
          }
        } 
        let results = JSON.parse(JSON.stringify(responseJson)).results
        let state, city, cityType, locality, administrative_area_level_3, neighborhood = null;
        results[0].address_components.forEach( component => {
          component.types.forEach( type => {
            if (type == "administrative_area_level_1") {
              state = component.short_name;
              this._isMounted && this.setState({state})
            }
            if (type == "locality") {
              locality = component.long_name;
            }
            if (type == "administrative_area_level_3") {
              administrative_area_level_3 = component.long_name;
            }
            if (type == "neighborhood") {
              neighborhood = component.long_name;
            }
          })
        })
        if (results[0].formatted_address.includes(neighborhood)) {
          city = neighborhood;
          cityType = "neighborhood";
          this._isMounted && this.setState({city:city, cityType:cityType});
        } else if (results[0].formatted_address.includes(locality)) {
          city = locality;
          cityType = "locality";
          this._isMounted && this.setState({city:city, cityType:cityType});
        } else if (results[0].formatted_address.includes(administrative_area_level_3)) {
          cityType = "administrative_area_level_3";
          city = administrative_area_level_3;
          this._isMounted && this.setState({city:city, cityType:cityType});
        } else if((neighborhood != null) ||(locality != null) || (administrative_area_level_3 != null)) {
          if (neighborhood != null) {
            city = neighborhood;
            cityType = "neighborhood";
            this._isMounted && this.setState({city:city, cityType:cityType});
          } else if (locality != null) {
            city = locality;
            cityType = "locality";
            this._isMounted && this.setState({city:city, cityType:cityType});
          } else if (administrative_area_level_3 != null) {
            cityType = "administrative_area_level_3";
            city = administrative_area_level_3;
            this._isMounted && this.setState({city:city, cityType:cityType});
          }
        } else {
          // insert error message for when an address gets returned with no neighborhood, locality, or administrative_area_level_3 is returned and kill the search
        }
        
        this.queryDB(city,cityType,state);
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
      return (
        <TouchableOpacity style = {styles.leaderBoardCell} onPress={()=>this.props.toggleInfoPage(item.hub)}>
          <Text style = {{...styles.leaderboardText,fontWeight:'bold',color:"black"}}> {item.key} </Text>
              {renderMarkerIcon(item.hub.stats.cost)}
          <View style = {{display:'flex', flexDirection:'column'}}>
            <Text style = {styles.leaderboardText}> {item.hub.location.number} {item.hub.location.street} </Text>
            <Text style = {{...styles.leaderboardText, fontSize: Dimensions.get('window').width*0.0290, color:'grey'}}> {this.distanceFromUser(item.hub)} </Text>
          </View>
  
          <View style = {styles.LBinnerBox}>
            <Text style = {{color:'black',fontSize:Dimensions.get('window').width*0.0483, fontWeight:'bold'}}>{item.hub.stats.cost}</Text>
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
  
            <Text style = {{...styles.locationText, fontSize:Dimensions.get('window').width*0.0725, fontWeight:'bold'}}>
              Leaderboard
            </Text>

            {this.state.showLeaderboard  && <View 
              style={{...styles.locationText}}
              >
                <Text style={{fontSize:Dimensions.get('window').width*0.0483}}>{this.state.city + ", " + this.state.state}</Text>
                {!this.state.searching && <TouchableOpacity onPress = {this.initiateSearch}>
                  {renderSearch()}
                </TouchableOpacity>}
                {this.state.searching && <TouchableOpacity onPress = {this.clearSearch}>
                  <Text style = {{color: 'red', fontSize:Dimensions.get('window').width*0.0386}}>x</Text>
                </TouchableOpacity>}
            </View>}

            {this.state.searching && <View style={{marginTop: '2%', width:'90%',flex:1,backgroundColor:'transparent'}}>
              <GooglePlacesAutocomplete
                placeholder="Search City"
                minLength={1}
                autoFocus={false}
                returnKeyType={'search'}
                listViewDisplayed="auto"
                fetchDetails={false}
                onPress={(data) => {
                  this.handleSearch(data);
                }}
                getDefaultValue={() => {
                  return '';
                }}
                query={{
                  key: apiKey,
                  language: 'en',
                  types: '(cities)'
                  // types: 'geocode'
                }}
                styles={{
                  textInputContainer: {
                    backgroundColor: 'white',
                    borderColor:'white',
                    borderWidth: Dimensions.get('window').width*0.00242,
                    borderTopWidth: 0,
                    borderBottomWidth:0
                  },
                  textInput: {
                    backgroundColor: 'white',
                    borderColor:'black',
                    borderWidth: 1,
                  },
                  description: {
                    fontWeight: 'bold',
                  },
                  predefinedPlacesDescription: {
                    color: '#007AFF',
                  },
                }}
                currentLocationLabel="Current location"
              />
            </View>}
              
            
            
  
            {!this.state.showLeaderboard && !this.state.searching && <View style={{position:'absolute',top:'50%', display: "flex", flexDirection:"column", justifyContent:"flex-start",alignItems:"center"}}>
                {renderLoadingFire()}
                <Text style ={{color:"black", fontSize:Dimensions.get('window').width*0.0411}}> Loading... </Text>
            </View>}
  
            {this.state.showLeaderboard && !this.state.searching && <FlatList
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