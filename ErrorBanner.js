import React from 'react';
import {View,Text} from 'react-native';
import styles from './styles.js'


export default class Leaderboard extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style = {styles.errorBanner}>
              <Text>{this.props.error}</Text>
            </View>  
        );
      }
}