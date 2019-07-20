import React from 'react';
import {View, TouchableOpacity, Button} from 'react-native';
import styles from './styles.js'
import {renderVotingLit, renderVotingShit} from './renderImage.js'

export default class sideTab extends React.Component {
    render() {
        return (
            <View style = {[styles.tab,this.props.style]}> 
                <TouchableOpacity onPress= {this.props.clickFire}>
                    {renderVotingLit()}
                </TouchableOpacity>

                <TouchableOpacity onPress= {this.props.clickShit}>
                    {renderVotingShit()}
                </TouchableOpacity>

                <Button style={styles.tabStyle} title = 'ⓘ' onPress= {this.props.clickInfo} />
            </View>
        );
    }
}