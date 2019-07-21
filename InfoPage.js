import React from 'react';
import {TouchableOpacity, View, Image, Text, ActivityIndicator} from 'react-native';
import styles from './styles.js'
import {VictoryLine, VictoryChart, VictoryTooltip,VictoryAxis, VictoryVoronoiContainer} from "victory-native";
import * as d3 from 'd3-time';
import dateFns from 'date-fns';
import {ButtonGroup} from 'react-native-elements';
import CustomFlyout from './CustomFlyout.js';
import {renderLoadingFire, renderRefresh, renderLandmark} from './renderImage'

export default class InfoPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showChart: false,
            showLine: false,
            originalData: [],
            processedData:[],
            selectedIndex: 0,
            timeToLit: {},
            timeToShit:{},
            maxValue: 0,
            minValue: 0,
        }

        this.updateIndex = this.updateIndex.bind(this)
        this.processDates = this.processDates.bind(this);
        this.updateState = this.updateState.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.filterData = this.filterData.bind(this);
        this.closeInfoPage = this.closeInfoPage.bind(this);
        this.getData = this.getData.bind(this);
        this.filterDataByInterval = this.filterDataByInterval.bind(this);
        this.goToMarker = this.goToMarker.bind(this);
        this.getPercentDifference = this.getPercentDifference.bind(this);
    }

    goToMarker() {
        this.setState({ showChart: false },
            this.props.goToMarker())
    }

    closeInfoPage() {
        this.setState({ showChart: false },()=>{this.props.toggleInfoPage()});
    }

    updateIndex (selectedIndex) {
        this.setState({selectedIndex},()=>{this.setState({ showLine: false },()=>{this.filterData(this.state.originalData,this.state.timeToLit,this.state.timeToShit,this.updateState)});
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

    getPercentDifference(objectArray,val) {
        let difference = val - objectArray[0].value;
        if (objectArray[0].value === 0) {
            return difference * 100;
        } else {
            return (difference/objectArray[0].value) * 100;
        }
    }

    getData() {
        this.setState({ showLine: false })
        let data = [];
        let lastCount = 0;
        let lastLit = 0
        let lastShit = 0
        let timeToLit = {};
        let timeToShit = {};
        db.collection("locations").doc(this.props.infoPageMarker.location.address).collection('upvotes_downvotes')
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

            this.setState({lastLit:lastLit, lastShit:lastShit})

            this.setState({
                originalData: this.processDates(data)
            },()=>{this.filterData(this.state.originalData,timeToLit,timeToShit,this.updateState)});
          })
    }

    filterData(data, timeToLit, timeToShit,callback) {
        let filteredData = this.filterDataByInterval(this.state.selectedIndex.toString(),data);
        if (filteredData.length == 1) {
            timeToLit[(parseInt(filteredData[0].time)-(1 * 60 * 1000))] = this.state.lastLit
            timeToShit[(parseInt(filteredData[0].time)-(1 * 60 * 1000))] = this.state.lastShit
            filteredData.unshift({value:filteredData[0].value,time:(parseInt(filteredData[0].time)-(1 * 60 * 1000))})
        }

        callback(filteredData,timeToLit,timeToShit);
        return filteredData
    }

    processDates(objectArray) {
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
        return array;
    }

    updateState(data,timetoLit,timetoShit) {
        let max = Math.max.apply(Math, data.map(function(o) { return o.value; }))
        let min = Math.min.apply(Math, data.map(function(o) { return o.value; }))
        this.setState({ maxValue: max});
        this.setState({ minValue: min});
        this.setState({ processedData: data, selectedValue: data[data.length-1].value, selectedTime: data[data.length-1].time,timeToLit:timetoLit, timeToShit:timetoShit},()=>this.setState({ showChart: true, showLine:true }));
    }

    componentDidMount() {
        setTimeout(() => {
            this.getData(); 
            }, 1000);
    };

    render() {    
        const buttons = ['1h', '3h', '12h','24h', 'All']
        const { selectedIndex } = this.state

        let exitOption = this.props.leaderboardStatus ? '<': 'X';

        let percentDifference = 0;
        if (this.state.processedData.length > 0 && this.state.selectedValue) {
            percentDifference = this.getPercentDifference(this.state.processedData,this.state.selectedValue);
        }

        let delta = "";
        let deltaColor = ""
        if (percentDifference >= 0) {
            delta = "+" + percentDifference.toFixed(2).toString() + "%"
            deltaColor = "rgb(38,169,113)"
        } else {
            delta = percentDifference.toFixed(2).toString() + "%"
            deltaColor = "red"
        }

        return (
            <View style={[styles.infoPage,this.props.style]}>
                {!this.state.showChart && <View style={{position:'absolute',top:'50%', display: "flex", flexDirection:"column", justifyContent:"flex-start",alignItems:"center"}}>
                    {renderLoadingFire()}
                    <Text style ={{color:"black", fontSize: 17}}> Loading... </Text>
                </View>}

                <View style = {{marginTop:20}} >
                    {(this.state.selectedValue!==null && this.state.showChart) && <Text style = {{fontSize: 30, alignSelf:"center", color:"black"}}>{this.state.selectedValue.toString() + " LF"}</Text>}
                    {(this.state.selectedValue!==null && this.state.showChart) && <Text style = {{fontSize: 15, alignSelf:"center", color:deltaColor}}>{delta}</Text>}
                    {(this.state.selectedTime && this.state.showChart) && <Text style = {{fontSize: 15, alignSelf:"center", color:"grey"}}>{dateFns.format(d3.timeSecond(this.state.selectedTime),"hh:mm:ss A")}</Text>}

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
                    height={375}
                    width={375}
                    padding={{ top: 30, bottom: 10, left: 50, right: 50 }}
                    domain={{y: [this.state.minValue-.5, this.state.maxValue+.5], x: [this.state.processedData[0].time-(1),this.state.processedData[this.state.processedData.length-1].time+(1)]}}
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
                        data: { stroke: "black" },
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
                            color: "black",
                            fill: "black",
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
                                        

                {!this.state.showLine && <View style ={styles.loading}>
                    <ActivityIndicator size="small" color="white" />
                </View>}

                {this.state.showChart && <View style={{
                    height:1,
                    width:"100%",
                    backgroundColor:"lightgrey"
                }}/>}

                {this.state.showLine && <TouchableOpacity onPress={() => this.getData()} style={styles.refresh}>
                    {renderRefresh()}
                </TouchableOpacity>}
                
                {this.state.showChart&& <View>
                    <View style ={{display:"flex", flexDirection:"row", justifyContent: "center"}}>
                        <TouchableOpacity onPress={this.goToMarker}>
                            {renderLandmark()}
                        </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity onPress={this.goToMarker}>
                        <Text style = {{...styles.locationText, fontSize: 15}}>
                            {this.props.infoPageMarker.location.address}
                        </Text>
                    </TouchableOpacity>
                </View>}

                {this.state.showChart&&<TouchableOpacity onPress={this.closeInfoPage} style = {styles.closeBar}>
                    <Text style = {{color:'white',fontWeight:'bold'}}>{exitOption}</Text>
                </TouchableOpacity>}
            </View>
        );
    } 
}