import React from 'react';
import {View, Button} from 'react-native';
import styles from './styles.js'

export default class sideTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {};
    componentWillMount() {};

    render() {
        return (
            <View style = {[styles.tab,this.props.style]}> 
                <Button style={styles.tabStyle} title = '🔥' onPress= {this.props.clickFire}/>
                <Button style={styles.tabStyle} title = '💩' onPress= {this.props.clickShit} />
                <Button style={styles.tabStyle} title = 'ⓘ' onPress= {this.props.clickInfo} />
            </View>
        );
    }
}