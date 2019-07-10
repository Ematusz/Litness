import React from 'react';
import {TouchableOpacity,View, Image} from 'react-native';
import styles from './styles.js'

export default class AddHubTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {};
    componentWillMount() {};

    render() {
        return (
            <View style= {[styles.addHubButton,this.props.style]}>
                <TouchableOpacity onPress={this.props.setGhost}>
                <Image
                        style = {{flex:1,
                                height: 30,
                                resizeMode: 'contain',
                                width: 30,}}
                        source={require('./assets/insertMarker.png')}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}