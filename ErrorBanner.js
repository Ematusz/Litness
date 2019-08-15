import React from 'react';
import {View,Text,TouchableOpacity} from 'react-native';
import styles from './styles.js'


export default class Leaderboard extends React.Component {
    constructor(props) {
        super(props);

        this.refreshPositionToggle = this.refreshPositionToggle.bind(this);
    }

    refreshPositionToggle(connectionType) {
        if (connectionType == "wifi" || connectionType == "cellular") {
            console.log(connectionType);
            this.props.refreshWatchPosition()
        }
    }

    render() {
        return (
            <View style = {styles.errorBanner}>
                <TouchableOpacity 
                    style={{
                        flex:1, 
                        alignContent:"center",
                        justifyContent:"center",
                        paddingRight:10,
                        paddingLeft:10
                    }} 
                    onPress={()=>this.refreshPositionToggle(this.props.connectionType.type)}>
                    <Text>{this.props.error}</Text>
                </TouchableOpacity>
            </View>  
        );
      }
}