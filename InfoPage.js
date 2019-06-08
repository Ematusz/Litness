import React from 'react';
import {TouchableOpacity,View, Image,Text} from 'react-native';
import styles from './styles.js'
import { LineChart, YAxis, XAxis, Grid } from 'react-native-svg-charts'
import * as scale from 'd3-scale';
import dateFns from 'date-fns';

export default class InfoPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {};
    componentWillMount() {};

    render() {
        const contentInset = { top: 10, bottom: 10}
        return (
            <View style={[styles.infoPage,this.props.style]}>
                <TouchableOpacity onPress={this.props.toggleInfoPage} style = {styles.closeBar}>
                <Text style = {{color:'white',fontWeight:'bold'}}>X</Text>
                </TouchableOpacity>
                <Text style = {{...styles.locationText, fontSize: 30, fontWeight:'bold'}}>
                Info
                </Text>
                <Text style = {{...styles.locationText, fontSize: 15}}>
                {this.props.infoPageMarker}
                </Text>
                <Text style = {{...styles.locationText}}>
                🔥 = {this.props.returnUpVotes}          💩 = {this.props.returnDownVotes}
                </Text>
                {/* <Text style = {{...styles.locationText}}>
                
                </Text> */}
                <View style={{ padding: 10, height: 350, flexDirection: 'row' }}>
                    {/* <Image
                        style={{flex:1}}
                        source={require('./assets/logsfire.png')}
                    /> */}
                    <YAxis
                        style={{marginBottom: 55}}
                        data={ this.props.data_ }
                        yAccessor = {({item}) => item.value}
                        contentInset={ contentInset }
                        svg={{
                            fill: 'grey',
                            fontSize: 12,
                        }}
                        numberOfTicks={ 10 }
                        formatLabel={ value => `${value}` }
                    />
                    <View style={{ flex: 1, marginLeft: 10}}>
                        <LineChart
                            style={{ flex: 1}}
                            data={ this.props.data_ }
                            yAccessor = {({item}) => item.value}
                            xAccessor = {({item}) => item.time}
                            svg={{ stroke: 'rgb(134, 65, 244)' }}
                            contentInset={ contentInset }
                        >
                            <Grid/>
                        </LineChart>
                        <XAxis
                            data={ this.props.data_ }
                            style={{ marginHorizontal: -10, height: 55}}
                            xAccessor = {({item}) => item.time}
                            svg={{
                                fontSize: 12,
                                fill: "grey",
                                rotation: 70,
                                originY: 15,
                                y: 42
                            }}
                            scale={scale.scaleTime}
                            // numberOfTicks={ 9 }
                            // contentInset = {{ right: 10, left: 10 }}
                            formatLabel={value => { return dateFns.format(value, "hh:mm A"); }}
                        />
                    </View>
                </View>
            </View>
        );
    }
}