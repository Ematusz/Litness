import React from 'react';
import {View,Text,TouchableOpacity} from 'react-native';
import styles from './styles.js';
import Dimensions from 'Dimensions';


export default class Leaderboard extends React.Component {
    constructor(props) {
        super(props);

        this.refreshPositionToggle = this.refreshPositionToggle.bind(this);
    }

    refreshPositionToggle(connectionType) {
        if (connectionType == "wifi" || connectionType == "cellular") {
            this.props.bannerErrorHandler({state: false, message: null})
            this.props.animateToLocation()
        }
    }

    render() {
        return (
            <View style = {styles.errorBanner}>
                <View style={{
                        flex:1, 
                        alignContent:"center",
                        justifyContent:"center",
                        paddingRight:10,
                        paddingLeft:10
                    }} >
                    <Text style = {{fontSize:Dimensions.get('window').width*0.0362}}>{this.props.error}</Text>
                </View>
                <TouchableOpacity 
                    style={{
                        position:"absolute",
                        right: 5,
                        top:5
                    }} 
                    onPress={()=>this.refreshPositionToggle(this.props.connectionType.type)}>
                    <Text style = {{color: "red", fontSize:Dimensions.get('window').width*.0483}}>x</Text>
                </TouchableOpacity>
            </View>  
        );
      }
}