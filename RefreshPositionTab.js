import React from 'react';
import {TouchableOpacity, View, ActivityIndicator} from 'react-native';
import styles from './styles.js'
import {renderRefreshPositionTabIcon} from './renderImage.js'

export default class RefreshPositionTab extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <View style= {[styles.refreshPositionButton,this.props.style]}>
                {!this.props.refreshingPosition && <TouchableOpacity onPress={this.props.refreshWatchPosition}>
                    {renderRefreshPositionTabIcon()}
                </TouchableOpacity>}
                {this.props.refreshingPosition && <ActivityIndicator />}
            </View>
        );
    }
}