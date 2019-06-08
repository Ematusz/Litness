import React from 'react';
import {TouchableOpacity,View,Image,Text,ActivityIndicator} from 'react-native';
import styles from './styles.js'
import { LineChart, YAxis, XAxis, Grid } from 'react-native-svg-charts'
import * as scale from 'd3-scale';
import * as d3 from 'd3-time';
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
        if (this.props.data_.length > 0) {
            let length = this.props.data_.length;
            // console.log(this.props.data_[0].time, " ", this.props.data_[length-1].time)
            let xaxis = d3.timeMinute.range(this.props.data_[0].time, this.props.data_[length-1].time);
            xaxis.push(this.props.data_[0].time);
            xaxis.push(this.props.data_[length-1].time);
            console.log("xaxis ", xaxis);
            console.log(this.props.data_)
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
                    <View style={{ alignItems: 'center', padding: 10, height: 350, flexDirection: 'row' }}>
                        <Image
                            style={{
                                marginBottom:55,
                                height: 40,
                                width: 40
                            }}
                            source={require('./assets/logsfire.png')}
                        />
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
                                scale={scale.scaleTime}
                                contentInset={ contentInset }
                            >
                                <Grid/>
                            </LineChart>
                            <XAxis
                                data={ xaxis }
                                style={{ marginHorizontal: -10, height: 55}}
                                xAccessor = {({item}) => item}
                                svg={{
                                    fontSize: 12,
                                    fill: "grey",
                                    rotation: 70,
                                    translate: 20,
                                    originY: 15,
                                    y: 42
                                }}
                                scale={scale.scaleTime}
                                // numberOfTicks={ 5 }
                                // contentInset = {{ right: 10, left: 10 }}
                                formatLabel={value => { /*console.log(value)*/; return dateFns.format(value, "hh:mm A"); }}
                            />
                        </View>
                    </View>
                </View>
            );
        } else {
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
                    <ActivityIndicator
                        animating={true}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 80
                        }}
                        size="large"
                    />
                </View>
            )
            
        }
        
    }
}