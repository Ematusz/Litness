import React from 'react';
import {TouchableOpacity,View,Image,Text,ActivityIndicator} from 'react-native';
import styles from './styles.js'
// import { LineChart, YAxis, XAxis, Grid } from 'react-native-svg-charts'
// import { Defs, LinearGradient, Stop, G} from 'react-native-svg'
import { VictoryLine, VictoryChart,VictoryLabel, VictoryAxis,VictoryZoomContainer} from "victory-native";
import * as scale from 'd3-scale';
import * as d3 from 'd3-time';
import dateFns from 'date-fns';

export default class InfoPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showGraph: false,
        }
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({ showGraph: true });
            console.log(this.props.data_)
            }, 3000);
    };
    componentWillMount() {};
    
    render() {        
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

                {this.state.showGraph && <View >
                    <VictoryChart
                    height={350}
                    width={350}
                    containerComponent={
                        <VictoryZoomContainer allowZoom={false}/>
                      }
                      scale={{ x: "time", y: "linear" }}
                    >
                        
                        <VictoryLine
                        style={{
                        data: { stroke: "#B22222" },
                        }}
                        data={this.props.data_}
                        x="time"
                        y="value"
                        animate
                        />

                        <VictoryAxis 
                        standalone={false}
                        fixLabelOverlap={true}
                        />

                        <VictoryAxis dependentAxis 
                        standalone={false}/>
                        
                        
                    </VictoryChart>
                </View>}
                
                {!this.state.showGraph && <View>
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
                    <Text>Loading...</Text>
                </View>}
            </View>
            );
        } 
    }