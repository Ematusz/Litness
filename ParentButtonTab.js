import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import styles from './styles.js'
import {renderLeaderboardTabIcon} from './renderImage.js'
import {renderAddMarkerIcon} from './renderImage.js'
import {renderTutorialPageIcon} from './renderImage.js'

export default class ParentButtonTab extends React.Component {
    render() {
        return (
            <View style= {[styles.parentButtonTab,this.props.style]}>
                <TouchableOpacity style={styles.leaderboardButton} onPress={this.props.toggleLeaderBoard}>
                    {renderLeaderboardTabIcon()}
                </TouchableOpacity>
                <TouchableOpacity style={styles.addHubButton} onPress={this.props.setGhost}>
                    {renderAddMarkerIcon()}
                </TouchableOpacity>
                <TouchableOpacity style={styles.tutorialPageButton} onPress={this.props.toggleTutorialPage}>
                    {renderTutorialPageIcon()}
                </TouchableOpacity>
            </View>
        );
    }
}