import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import styles from './styles.js'
import {renderRefreshPositionTabIcon} from './renderImage.js'

export default class RefreshPositionTab extends React.Component {
    render() {
        return (
            <View style= {[styles.refreshPositionButton,this.props.style]}>
                <TouchableOpacity onPress={this.props.refreshWatchPosition}>
                    {renderRefreshPositionTabIcon()}
                </TouchableOpacity>
            </View>
        );
    }
}