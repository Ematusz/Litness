import React from 'react';
import {View, TouchableOpacity, Image, Button} from 'react-native';
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
                <TouchableOpacity onPress= {this.props.clickFire}>
                    <Image
                            style = {{
                                height: 40,
                                resizeMode: 'contain',
                                width: 35,}}
                            source={require('./assets/fire.png')}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress= {this.props.clickShit}>
                    <Image
                            style = {{
                                height: 40,
                                resizeMode: 'contain',
                                width: 30,}}
                            source={require('./assets/poop.png')}
                    />
                </TouchableOpacity>
                <Button style={styles.tabStyle} title = 'ⓘ' onPress= {this.props.clickInfo} />
            </View>
        );
    }
}