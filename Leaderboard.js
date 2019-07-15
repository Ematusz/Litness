import React from 'react';
import {TouchableOpacity,View, ActivityIndicator,Button,Image,Text, FlatList} from 'react-native';
import styles from './styles.js'

export default class Leaderboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          processedData:[],
          refreshing: true,
          showLeaderboard: false,
          selectedIndex: 0,
        }

        this.renderLeaderboardCell = this.renderLeaderboardCell.bind(this);
        this.getData = this.getData.bind(this);
        this.refresh = this.refresh.bind(this);
        this.updateIndex = this.updateIndex.bind(this)
    }

    updateIndex (selectedIndex) {
      this.setState({selectedIndex})
  }

    componentDidMount() {
        setTimeout(() => {
            this.getData();            
            }, 1000);
    };
    componentWillMount() {};

    refresh() {
      this.setState({refreshing:true});
      this.getData()
    }

    getData() {
        let data = [];
        db.collection('locations').where("city", "==", this.props.userCity).orderBy('count', 'desc').limit(25).get()
          .then( snapshot => {
            let counter = 1;
            snapshot.forEach( doc => {
              data.push({
                geohash: doc.data().geohash[0],
                address: doc.id.toString(),
                number: doc.data().number,
                street: doc.data().street,
                city: doc.data().city,
                count: doc.data().count,
                key: counter.toString(),
                coordinate: {latitude: doc.data().latitude, longitude: doc.data().longitude}
              });
              counter = counter + 1;
            })
  
          this.setState({ processedData: data },()=>this.setState({ showLeaderboard: true,refreshing:false }));
          }).catch( error =>{
            console.log(error)
          })
    }

    renderLeaderboardCell =  ({item}) => {
        return (
          <TouchableOpacity style = {styles.leaderBoardCell} onPress={()=>this.props.toggleInfoPage(item)}>
            <Text style = {{...styles.leaderboardText,fontWeight:'bold',color:"black"}}> {item.key} </Text>
                {this.props.renderImage(item.count)}
            <Text style = {styles.leaderboardText}> {item.number} {item.street}</Text>
            <View style = {styles.LBinnerBox}>
              <Text style = {{color:'black',fontSize:20}}>{item.count}</Text>
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
                {this.state.showLeaderboard && <TouchableOpacity onPress={this.props.toggleLeaderBoard} style = {styles.closeBar}>
                  <Text style = {{color:'white',fontWeight:'bold'}}>X</Text>
                </TouchableOpacity>}

                <TouchableOpacity onPress={this.refresh} style={styles.refresh}>
                    <Image
                        style = {{flex:1,
                                height: 15,
                                resizeMode: 'contain',
                                width: 15,
                                alignSelf: 'center'}}
                        source={require('./assets/refresh.png')}
                    />
                </TouchableOpacity>

                <Text style = {{...styles.locationText, fontSize: 30, fontWeight:'bold'}}>
                  Leaderboard
                </Text>

                {!this.state.showLeaderboard && <View style={{position:'absolute',top:'50%', display: "flex", flexDirection:"column", justifyContent:"flex-start",alignItems:"center"}}>
                    <Image
                        style = {{...styles.emojiIcon,backgroundColor:"white",borderWidth:0, alignSelf:'center'}}
                        source={{uri:"https://media.giphy.com/media/MFyEVDtwt0gaQ0MGmm/giphy.gif"}}
                    />
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