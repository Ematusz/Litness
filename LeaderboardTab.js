import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import styles from './styles.js'
import {renderLeaderboardTabIcon} from './renderImage.js'

export default class LeaderboardTab extends React.Component {
    render() {
        return (
            <View style= {[styles.leaderBoardButton,this.props.style]}>
                <TouchableOpacity onPress={this.props.toggleLeaderBoard}>
                    {renderLeaderboardTabIcon()}
                </TouchableOpacity>
            </View>
        );
    }
}