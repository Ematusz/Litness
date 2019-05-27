import React from 'react';
import { TouchableOpacity,FlatList,Animated, Text, View, Button, Image } from 'react-native';
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

            <View style = {{position:'absolute',
                            height:40, 
                            width:40,
                            left:'50%',
                            top:'50%',
                            backgroundColor:'blue'}}>

            </View>
        );
    }

}