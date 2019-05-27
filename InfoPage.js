import React from 'react';
import {TouchableOpacity,View, Button,Text} from 'react-native';
import styles from './styles.js'

export default class InfoPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {};
    componentWillMount() {};

    render() {
        return (
            <View style={[styles.infoPage,this.props.style]}>
                <TouchableOpacity onPress={this.props.toggleInfoPage} style = {styles.closeBar}>
                <Text style = {{color:'white',fontWeight:'bold'}}>X</Text>
                </TouchableOpacity>
                <Text style = {{...styles.locationText, fontSize: 30, fontWeight:'bold'}}>
                Analytics
                </Text>
                <Text style = {{...styles.locationText}}>
                {this.props.infoPageMarker}
                </Text>
                <Text style = {{...styles.locationText}}>
                🔥 = {this.props.returnUpVotes}
                </Text>
                <Text style = {{...styles.locationText}}>
                💩 = {this.props.returnDownVotes}
                </Text>
            </View>
        );
    }
}