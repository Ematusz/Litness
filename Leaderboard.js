import React from 'react';
import {TouchableOpacity,View, ActivityIndicator,Button,Image,Text, FlatList} from 'react-native';
import styles from './styles.js'

export default class Leaderboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showLeaderboard: false,
            processedData:[],
        }

        this.renderLeaderboardCell = this.renderLeaderboardCell.bind(this);
        this.getData = this.getData.bind(this);
    }

    componentDidMount() {
        setTimeout(() => {
            this.getData();            
            }, 1000);
    };
    componentWillMount() {};

    getData() {
        this.setState({ showLeaderboard: false })
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
                count: doc.data().count,
                key: counter.toString()   
              });
              counter = counter + 1;
            })
  
          this.setState({ processedData: data },()=>this.setState({ showLeaderboard: true }));
          }).catch( error =>{
            console.log(error)
          })
    }

    renderLeaderboardCell =  ({item}) => {
        return (
          <TouchableOpacity style = {styles.leaderBoardCell} onPress={()=>this.props.toggleInfoPage(item.address,item.geohash)}>
            <Text style = {{...styles.leaderboardText,fontWeight:'bold',color:"black"}}> {item.key} </Text>
                {this.props.renderImage(item.count)}
            <Text style = {styles.leaderboardText}> {item.number} {item.street}</Text>
            <View style = {styles.LBinnerBox}>
              <Text style = {{color:'black',fontSize:20}}>{item.count}</Text>
            </View>
          </TouchableOpacity>
        )
    }

    render() {
        return (
            <View style={[styles.leaderboard,this.props.style]}>
                <TouchableOpacity onPress={this.props.toggleLeaderBoard} style = {styles.closeBar}>
                <Text style = {{color:'white',fontWeight:'bold'}}>X</Text>
                </TouchableOpacity>
                {this.state.showLeaderboard && <TouchableOpacity onPress={() => this.getData()} style={styles.refresh}>
                    <Image
                        style = {{flex:1,
                                height: 20,
                                resizeMode: 'contain',
                                width: 20,
                                alignSelf: 'center'}}
                        source={require('./assets/refresh.png')}
                    />
                </TouchableOpacity>}
                <Text style = {{...styles.locationText, fontSize: 30, fontWeight:'bold'}}>
                Leaderboard
                </Text>
                {this.state.showLeaderboard && <FlatList
                data = {this.state.processedData}
                renderItem = {this.renderLeaderboardCell}
                style={styles.flatListContainer}
                />}
                {!this.state.showLeaderboard && <View style ={styles.loading}>
                    <ActivityIndicator size="small" color="white" />
                </View>}
            </View>
        );
    }
}