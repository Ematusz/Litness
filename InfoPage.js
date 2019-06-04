import React from 'react';
import {TouchableOpacity,View, Button,Text} from 'react-native';
import styles from './styles.js'
import { LineChart, YAxis, Grid } from 'react-native-svg-charts'

export default class InfoPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {};
    componentWillMount() {};

    render() {
        const contentInset = { top: 20, bottom: 20 }
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
                <View style={{ height: 300, flexDirection: 'row' }}>
                    <YAxis
                        data={ this.props.data_ }
                        yAccessor = {({item}) => item.value}
                        contentInset={ contentInset }
                        svg={{
                            fill: 'grey',
                            fontSize: 10,
                        }}
                        numberOfTicks={ 10 }
                        formatLabel={ value => `${value}` }
                    />
                    <LineChart
                        style={{ flex: 1, marginLeft: 16, marginRight: 16}}
                        data={ this.props.data_ }
                        yAccessor = {({item}) => item.value}
                        xAccessor = {({item}) => item.time}
                        svg={{ stroke: 'rgb(134, 65, 244)' }}
                        contentInset={ contentInset }
                    >
                        <Grid/>
                    </LineChart>
                </View>
            </View>
        );
    }
}