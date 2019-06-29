import React from 'react';
import {TouchableOpacity,Vibration,View,Button,Image,Text,ActivityIndicator} from 'react-native';
import styles from './styles.js'
// import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { VictoryLine, VictoryChart,VictoryLabel,VictoryCursorContainer,VictoryTheme, VictoryTooltip,VictoryAxis,VictoryZoomContainer,VictoryVoronoiContainer} from "victory-native";
import * as d3 from 'd3-time';
import dateFns from 'date-fns';
import { ButtonGroup} from 'react-native-elements';
import CustomFlyout from './CustomFlyout.js';

export default class activityMonitor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showChart: false,
            showLine: false,
            processedData:[],
            selectedIndex: 0,
            timeToLit: {},
            timeToShit:{},
            maxValue: 0,
            minValue: 0,
        }
        this.getPercentDifference = this.getPercentDifference.bind(this);
        this.processDates = this.processDates.bind(this);
        this.getData = this.getData.bind(this);
        this.updateIndex = this.updateIndex.bind(this);
        this.filterDataByInterval = this.filterDataByInterval.bind(this);
    }

    componentDidMount() {
        setTimeout(() => {
            this.getData(); 
            }, 1000);
    };
    componentWillMount() {};

    updateIndex (selectedIndex) {
        this.setState({selectedIndex})
        this.getData(); 
    }

    getPercentDifference(objectArray,val) {
        // console.log(objectArray)
        let difference = val - objectArray[0].value;
        return (difference/objectArray[0].value) * 100;
    }

    processDates(objectArray,obj1,obj2) {
        let array = [];
        let max = objectArray[0].value;
        let min = objectArray[0].value;
        for(i = 0; i < objectArray.length;i++) {
            let obj = objectArray[i];
            max = Math.max(max,objectArray[i].value)
            min = Math.min(min,objectArray[i].value)
            obj.time = parseInt(obj.time);

            if (array.length > 0 && obj.time === array[array.length-1].time) {
                array[array.length-1] = obj
            } else {
                array.push(obj)
            }
        }
        this.setState({ maxValue: max});
        this.setState({ minValue: min});
        this.setState({ processedData: array, selectedValue: array[array.length-1].value, selectedTime: array[array.length-1].time,timeToLit:obj1, timeToShit:obj2},()=>this.setState({ showChart: true, showLine:true }));
    }

    getData() {
        this.setState({ showLine: false })
        let data = [];
        let lastCount = 0;
        let lastLit = 0
        let lastShit = 0
        let timeToLit = {};
        let timeToShit = {};
        db.collection("locations").doc(this.props.markerAddress).collection('upvotes_downvotes')
          .get().then( snapshot => {
            snapshot.forEach( doc => {
              vote = {value:doc.data().count, time:doc.id}
              data.push(vote);
              lastCount = doc.data().count;
              lastLit = doc.data().upvotes;
              lastShit = doc.data().downvotes;
              timeToLit[parseInt(doc.id)] = doc.data().upvotes
              timeToShit[parseInt(doc.id)] = doc.data().downvotes
            })
            vote = {value:lastCount, time:(Date.now().toString())}
            data.push(vote);
            timeToLit[Date.now()] = lastLit
            timeToShit[Date.now()] = lastShit

            let filteredData = this.filterDataByInterval(this.state.selectedIndex.toString(),data);
            //no one has voted in past interval then prepend the latest value with time being one interval back
            if (filteredData.length == 1) {
                filteredData.unshift({value:filteredData[0].value,time:(parseInt(filteredData[0].time)-(1 * 60 * 60 * 1000)).toString()})
            }
            // console.log(filtetedData)
            this.processDates(filteredData,timeToLit,timeToShit)
          })
    }

    filterDataByInterval(selectedIndex,data) {
        let intervalInMs = 1 * 60 * 1000;
        let currentTime = Date.now();
        let lowerBound = 0;
        switch(selectedIndex) {
            case '0':
                intervalInMs = 1 * 60 * 60 * 1000;
                lowerBound = currentTime - intervalInMs;
                break;
            case '1':
                intervalInMs = 3 * 60 * 60 * 1000;
                lowerBound = currentTime - intervalInMs;
                break;
            case '2': 
                intervalInMs = 12 * 60 * 60 * 1000;
                lowerBound = currentTime - intervalInMs;
                break;
            case '3': 
                intervalInMs = 24 * 60 * 60 * 1000;
                lowerBound = currentTime - intervalInMs;
                break;
            case '4': 
                lowerBound = 0;
                break;
            default:
                intervalInMs = 24 * 60 * 60 * 1000;
                lowerBound = currentTime - intervalInMs;
                break;
        }

        return data.filter(x=>parseInt(x.time) > lowerBound);
    }

    render() {
        const buttons = ['1h', '3h', '12h','24h', 'All']
        const { selectedIndex } = this.state
        let percentDifference = 0;
        if (this.state.processedData.length > 0 && this.state.selectedValue) {
            percentDifference = this.getPercentDifference(this.state.processedData,this.state.selectedValue);
        }
        let stringBean = "";
        let colorString = ""
        if (percentDifference >= 0) {
            stringBean = "+" + percentDifference.toFixed(2).toString() + "%"
            colorString = "rgb(38,169,113)"
        } else {
            stringBean = percentDifference.toFixed(2).toString() + "%"
            colorString = "red"
        }
        return (
            <View style ={{backgroundColor:"red"}}>
                {!this.state.showChart && <View style={{marginTop:20, display: "flex", flexDirection:"row", justifyContent:"flex-start"}}>
                    <Text style ={{fontWeight:"bold", fontSize: 20}}> Loading Chart </Text>
                    <ActivityIndicator size="small" color="black" />
                </View>}

                <View style = {{marginTop:20}}>
                {(this.state.selectedValue && this.state.showChart) && <Text style = {{fontSize: 30, alignSelf:"center", color:"black"}}>{this.state.selectedValue.toString() + " LF"}</Text>}
                {(this.state.selectedValue && this.state.showChart) && <Text style = {{fontSize: 15, alignSelf:"center", color:colorString}}>{stringBean}</Text>}
                {(this.state.selectedTime && this.state.showChart) && <Text style = {{fontSize: 15, alignSelf:"center", color:"grey"}}>{dateFns.format(d3.timeMinute(this.state.selectedTime),"hh:mm A")}</Text>}
                {(this.state.selectedTime && this.state.showChart) && <View style = {{display:"flex", 
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
                            {this.state.timeToLit[this.state.selectedTime]}          
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
                            {this.state.timeToShit[this.state.selectedTime]}  
                        </Text>
                    </View>
                </View>}

                {this.state.showChart && <VictoryChart
                    height={350}
                    width={350}
                    // padding={{ top: 30, bottom: 10, left: 50, right: 50 }}
                    scale={{ x: "time", y: "linear" }}
                    containerComponent={
                        <VictoryVoronoiContainer
                        labels={(d) =>"."}
                        labelComponent={
                            <VictoryTooltip
                              flyoutComponent={<CustomFlyout/>}
                            />
                          }
                        onActivated={(points, props) => this.setState({selectedValue: points[0].value, selectedTime: points[0].time})}                    
                        />
                      }
                    >
                        
                        {this.state.showLine && <VictoryLine
                        style={{
                        data: { stroke: "rgb(240,148,59)" },
                        }}
                        data={this.state.processedData}
                        x="time"
                        y="value"
                        animate
                        />}

                        <VictoryAxis dependentAxis 
                        standalone={false}
                        tickFormat={(t) => `${Math.round(t*10)/10}`}
                        style={{ axis: {stroke: "none"} , tickLabels: {
                            color: "grey",
                            fill: "grey",
                            fontSize: '10px',
                            fontFamily: 'inherit',
                            fillOpacity: 1,
                            margin: 0,
                            padding: 0
                          }
                        }}
                        offsetX={350}
                        tickValues = {[this.state.minValue, this.state.maxValue]}
                        />

                    </VictoryChart>}
                </View>
                
                {this.state.showChart && <ButtonGroup
                        onPress={this.updateIndex}
                        selectedIndex={selectedIndex}
                        buttons={buttons}
                        containerStyle={{height: 20,backgroundColor:"transparent",borderColor:"transparent",width:'100%',alignSelf:'center'}}
                        selectedButtonStyle={{backgroundColor:"transparent"}}
                        selectedTextStyle = {{color: "black"}}
                        textStyle={{color:"lightgrey",fontSize:12,fontWeight:"bold"}}
                        underlayColor={'black'}
                        innerBorderStyle = {{width:0,color:'transparent'}}
                        containerBorderRadius={10}
                    />}

                {/* {!this.state.showLine && <View style ={styles.loading}>
                    <ActivityIndicator size="small" color="white" />
                </View>} */}

                {/* {this.state.showLine && <TouchableOpacity onPress={() => this.getData()} style={styles.refresh}>
                    <Image
                        style = {{flex:1,
                                height: 20,
                                resizeMode: 'contain',
                                width: 20,
                                alignSelf: 'center'}}
                        source={require('./assets/refresh.png')}
                    />
                </TouchableOpacity>} */}
            </View>
        );
    }
}