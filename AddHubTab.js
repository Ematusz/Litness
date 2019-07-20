import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import styles from './styles.js'
import {renderAddMarkerIcon} from './renderImage.js'

export default class AddHubTab extends React.Component {
    render() {
        return (
            <View style= {[styles.addHubButton,this.props.style]}>
                <TouchableOpacity onPress={this.props.setGhost}>
                    {renderAddMarkerIcon()}
                </TouchableOpacity>
            </View>
        );
    }
}