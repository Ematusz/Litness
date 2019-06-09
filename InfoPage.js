import React from 'react';
import {TouchableOpacity,View,Image,Text,ActivityIndicator} from 'react-native';
import styles from './styles.js'
import { LineChart, YAxis, XAxis, Grid } from 'react-native-svg-charts'
import { Defs, LinearGradient, Stop, G} from 'react-native-svg'
import * as scale from 'd3-scale';
import * as d3 from 'd3-time';
import dateFns from 'date-fns';

const Gradient = () => (
    <G>
        <Defs key={'gradient'}>
            <LinearGradient id={'gradient'} x1={'0'} y={'0%'} x2={'100%'} y2={'0%'}>
                <Stop offset={'0%'} stopColor={'rgb(134, 65, 244)'}/>
                <Stop offset={'100%'} stopColor={'rgb(66, 194, 244)'}/>
            </LinearGradient>
        </Defs>
    </G>
)

export default class InfoPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
        console.log(props)
    }

    componentDidMount() {
        console.log(this.props.data_)
    };
    componentWillMount() {};
    

    render() {
        const contentInset = { top: 10, bottom: 10}
        let length = this.props.data_.length;
        let xaxis = []

        if (this.props.data_.length > 0) {
            xaxis = d3.timeMinute.range(this.props.data_[0].time, this.props.data_[length-1].time);
        }
        
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

                {this.props.data_ && <View style={{ alignItems: 'center', padding: 10, height: 350, flexDirection: 'row' }}>
                    <YAxis
                        style={{marginBottom: 55}}
                        data={ this.props.data_}
                        yAccessor = {({item}) => item.value}
                        contentInset={ contentInset }
                        svg={{
                            fill: 'black',
                            fontSize: 12,
                        }}
                        numberOfTicks={5}
                        formatLabel={ value => `${value}` }
                        animate
                    />
                    <View style={{ flex: 1, marginLeft: 10}}>
                        <LineChart
                            style={{ flex: 1}}
                            data={ this.props.data_}
                            yAccessor = {({item}) => item.value}
                            xAccessor = {({item}) => item.time}
                            svg={{ strokeWidth: 2,
                                stroke: 'url(#gradient)'}}
                            scale={scale.scaleTime}
                            contentInset={ contentInset }
                            animate
                        >
                            <Grid/>
                            <Gradient/>
                        </LineChart>
                        <XAxis
                            data={ xaxis }
                            style={{ marginHorizontal: -10, height: 55}}
                            xAccessor = {({item}) => item}
                            svg={{
                                fontSize: 12,
                                fill: "black",
                                rotation: 70,
                                translate: 20,
                                originY: 15,
                                y: 42
                            }}
                            contentInset={ contentInset }
                            scale={scale.scaleTime}
                            formatLabel={value => {return dateFns.format(value, "hh:mm A"); }}
                            animate
                        />
                    </View>
                </View>}

                {!this.props.data_ && <ActivityIndicator
                    animating={true}
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 80
                    }}
                    size="large"
                /> }
            </View>
            );
        } 
    }