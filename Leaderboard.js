import React from 'react';
import {TouchableOpacity,View, Button,Image,Text, FlatList} from 'react-native';
import styles from './styles.js'

export default class Leaderboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}

        this.renderLeaderboardCell = this.renderLeaderboardCell.bind(this);
    }

    componentDidMount() {};
    componentWillMount() {};

    renderLeaderboardCell =  ({item}) => {
        return (
          <View style = {styles.leaderBoardCell}>
            <Text style = {{...styles.leaderboardText,fontWeight:'bold'}}> {item.key} </Text>
                {this.props.renderImage(item.count)}
            <Text style = {styles.leaderboardText}> {item.number} {item.street}</Text>
            <View style = {styles.LBinnerBox}>
              <Text style = {{color:'black',fontSize:20}}>{item.count}</Text>
            </View>
          </View>
        )
    }

    render() {
        return (
            <View style={[styles.infoPage,this.props.style]}>
                <TouchableOpacity onPress={this.props.toggleLeaderBoard} style = {styles.closeBar}>
                <Text style = {{color:'white',fontWeight:'bold'}}>X</Text>
                </TouchableOpacity>
                <Text style = {{...styles.locationText, fontSize: 30, fontWeight:'bold'}}>
                Leaderboard
                </Text>
                <FlatList
                data = {this.props.leaderBoard_}
                renderItem = {this.renderLeaderboardCell}
                style={styles.flatListContainer}
                />
            </View>
        );
    }
}