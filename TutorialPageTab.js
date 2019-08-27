import React from 'react';
import {TouchableOpacity, View, Text} from 'react-native';
import styles from './styles.js'

export default class TutorialPageTab extends React.Component {
    render() {
        return (
            <View style= {[styles.tutorialPageButton,this.props.style]}>
                <TouchableOpacity onPress={this.props.toggleTutorialPage}>
                    <Text>
                        ?
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }
}