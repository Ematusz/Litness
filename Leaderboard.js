import React from 'react';
import {TouchableOpacity,View, ActivityIndicator,Button,Image,Text, FlatList} from 'react-native';
import styles from './styles.js'
import { ButtonGroup} from 'react-native-elements';

export default class Leaderboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showLeaderboard: false,
            processedData:[],
            refreshing: true,
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
      // let data = [];
      //   db.collection('locations').where("city", "==", this.props.userCity).orderBy('count', 'desc').limit(25).get()
      //     .then( snapshot => {
      //       let counter = 1;
      //       snapshot.forEach( doc => {
      //         data.push({
      //           geohash: doc.data().geohash[0],
      //           address: doc.id.toString(),
      //           number: doc.data().number,
      //           street: doc.data().street,
      //           count: doc.data().count,
      //           key: counter.toString()   
      //         });
      //         counter = counter + 1;
      //       })
  
      //     this.setState({ processedData: data },()=>this.setState({ showLeaderboard: true , refreshing: false}));
      //     }).catch( error =>{
      //       console.log(error)
      //     })
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
                count: doc.data().count,
                key: counter.toString()   
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

    // renderHeader = () => {
    //   const buttons = ['Litness', 'Distance']
    //   const { selectedIndex } = this.state
    //   return (<ButtonGroup
    //     onPress={this.updateIndex}
    //     selectedIndex={selectedIndex}
    //     buttons={buttons}
    //     containerStyle={{height: 25,backgroundColor:"white",borderColor:"black",width:'60%',alignSelf:'center'}}
    //     selectedButtonStyle={{backgroundColor:"black"}}
    //     textStyle={{color:"black"}}
    //     underlayColor={'black'}
    //     innerBorderStyle = {{width:1,color:'black'}}
    //     containerBorderRadius={10}
    // />);
    // };

    render() {
        const buttons = ['Litness', 'Total Votes']
        const { selectedIndex } = this.state
        return (
            <View style={[styles.leaderboard,this.props.style]}>
                <TouchableOpacity onPress={this.props.toggleLeaderBoard} style = {styles.closeBar}>
                <Text style = {{color:'white',fontWeight:'bold'}}>X</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.refresh} style={styles.refresh}>
                    <Image
                        style = {{flex:1,
                                height: 20,
                                resizeMode: 'contain',
                                width: 20,
                                alignSelf: 'center'}}
                        source={require('./assets/refresh.png')}
                    />
                </TouchableOpacity>
                <Text style = {{...styles.locationText, fontSize: 30, fontWeight:'bold'}}>
                Leaderboard
                </Text>
                <ButtonGroup
                        onPress={this.updateIndex}
                        selectedIndex={selectedIndex}
                        buttons={buttons}
                        containerStyle={{height: 25,backgroundColor:"white",borderColor:"black",width:'80%',alignSelf:'center'}}
                        selectedButtonStyle={{backgroundColor:"black"}}
                        textStyle={{color:"black"}}
                        underlayColor={'black'}
                        innerBorderStyle = {{width:1,color:'black'}}
                        containerBorderRadius={10}
                  />
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