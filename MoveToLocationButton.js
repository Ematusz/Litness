import React from 'react';
import styles from './styles.js'
import {View, TouchableOpacity} from 'react-native';
import {renderTarget} from './renderImage.js'

export default class MoveToLocationButton extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <View style= {styles.moveToLocationStyle}>
                 <TouchableOpacity onPress={this.props.refreshWatchPosition}>
                    {renderTarget()}
                </TouchableOpacity>
            </View>
        );
    }
}