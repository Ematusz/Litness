import React from 'react';
import {TouchableOpacity,View,Button,Text,ActivityIndicator} from 'react-native';
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
            processedData:[],
        }

        this.processDates = this.processDates.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.updateChart = this.updateChart.bind(this);
    }

    updateChart() {
        console.log("Pressed!")
        this.setState({ showGraph: false })
        let data = [];
        db.collection("locations").doc(this.props.markerAddress).collection('counts')
          .get().then( snapshot => {
            snapshot.forEach( doc => {
              vote = {value:doc.data().count, time:doc.id}
              data.push(vote);
              lastCount = doc.data().count;
            })

            this.processDates(data)
          })
    }

    processDates(objectArray) {
        let array = [];

        for(i = 0; i < objectArray.length;i++) {
            let obj = objectArray[i];
            obj.time = dateFns.format(d3.timeMinute(new Date(parseInt(obj.time))),"hh:mm A"); 

            if (array.length > 0 && obj.time === array[array.length-1].time) {
                array[array.length-1] = obj
            } else {
                array.push(obj)
            }
        }

        let vote = {value:array[array.length-1].value, time:dateFns.format(d3.timeMinute(new Date()),"hh:mm A")}
        array.push(vote);

        this.setState({ processedData: array },()=>this.setState({ showGraph: true }));
    }

    componentDidMount() {
        setTimeout(() => {
            this.processDates(this.props.data_);
            console.log(this.state.processedData);
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
                        <VictoryZoomContainer allowZoom={true}/>
                      }
                      scale={{ x: "time", y: "linear" }}
                    >
                        
                        <VictoryLine
                        style={{
                        data: { stroke: "#B22222" },
                        }}
                        data={this.state.processedData}
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
                <Button style={styles.tabStyle} title = 'Refresh' onPress= {() => this.updateChart()}/>
            </View>
            );
        } 
    }