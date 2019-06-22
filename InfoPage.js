import React from 'react';
import {TouchableOpacity,View,Button,Image,Text,ActivityIndicator} from 'react-native';
import styles from './styles.js'
import { VictoryLine, VictoryChart,VictoryLabel, VictoryAxis,VictoryZoomContainer,VictoryVoronoiContainer} from "victory-native";
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
        this.getData = this.getData.bind(this);
    }

    getData() {
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
        if (objectArray.length === 1) {
            let prevote = {value:0, time:objectArray[0].time}
            array.unshift(prevote)
        }
        this.setState({ processedData: array },()=>this.setState({ showGraph: true }));
    }

    componentDidMount() {
        setTimeout(() => {
            this.getData();            
            }, 1000);
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

                {this.state.showGraph && <View style = {{display:"flex", 
                                flexDirection:"row", 
                                justifyContent:'center', 
                                alignItems:'center',
                                }}>

                    <View style = {{
                                alignItems:'center',
                                padding: 5}}>
                        <Image
                            style = {{...styles.infoPageIcons}}
                            source={require('./assets/fire.png')}
                        />
                        <Text style = {{...styles.locationText}}>
                            {this.props.returnUpVotes}          
                        </Text>
                    </View>
                    <View style = {{
                                alignItems:'center',
                                padding: 5}}>
                        <Image
                            style = {{...styles.infoPageIcons}}
                            source={require('./assets/poop.png')}
                        />
                        <Text style = {{...styles.locationText}}>
                            {this.props.returnDownVotes}          
                        </Text>
                    </View>
                </View>}

                <View>
                    {this.state.showGraph && <VictoryChart
                    height={375}
                    width={375}
                    containerComponent={
                        <VictoryVoronoiContainer/>
                        // <VictoryZoomContainer allowZoom={true} zoomDomain={{x: [this.state.processedData.length-4, this.state.processedData.length]}} />
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
                        standalone={false}
                        tickFormat={(t) => `${Math.round(t*10)/10}`}
                        />
                        
                        
                    </VictoryChart>}
                </View>
                
                {!this.state.showGraph && <View>
                    <ActivityIndicator size="large" color="black" />
                    <Text>Loading...</Text>
                </View>}
                <TouchableOpacity onPress={() => this.getData()} style={styles.refresh}>
                    <Image
                        style = {{flex:1,
                                height: 20,
                                resizeMode: 'contain',
                                width: 20,
                                alignSelf: 'center'}}
                        source={require('./assets/refresh.png')}
                    />
                </TouchableOpacity>
            </View>
            );
        } 
    }