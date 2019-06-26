import React from 'react';
import {TouchableOpacity,View,Button,Image,Text,ActivityIndicator} from 'react-native';
import styles from './styles.js'
import { VictoryLine, VictoryChart,VictoryLabel, VictoryAxis,VictoryZoomContainer,VictoryVoronoiContainer} from "victory-native";
import * as d3 from 'd3-time';
import dateFns from 'date-fns';
import { ButtonGroup} from 'react-native-elements';

export default class InfoPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showChart: false,
            showLine: false,
            originalData: [],
            processedData:[],
            selectedIndex: 0,
        }

        this.updateIndex = this.updateIndex.bind(this)
        this.processDates = this.processDates.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.closeInfoPage = this.closeInfoPage.bind(this);
        this.getData = this.getData.bind(this);
        this.filterDataByInterval = this.filterDataByInterval.bind(this);
        this.findSatisfyingIndex = this.findSatisfyingIndex.bind(this);
        this.calculateLowerbound = this.calculateLowerbound.bind(this);
        this.bin = this.bin.bind(this);
        this.goToMarker = this.goToMarker.bind(this);
    }

    goToMarker() {
        this.setState({ showChart: false },
        this.props.goToMarker(this.props.geohash,this.props.infoPageMarker));
    }

    closeInfoPage() {
        this.setState({ showChart: false },this.props.toggleInfoPage);
    }

    updateIndex (selectedIndex) {
        this.setState({selectedIndex})
        this.getData(); 
    }

    calculateLowerbound(selectedIndex) {
        let intervalInMs = 1 * 60 * 1000;
        let currentTime = Date.now();
        let lowerBound = 0;
        switch(selectedIndex) {
            case '0':
                intervalInMs = 5 * 60 * 1000;
                lowerBound = currentTime - intervalInMs;
                break;
            case '1':
                intervalInMs = 3 * 60 * 60 * 1000;
                lowerBound = currentTime - intervalInMs;
                break;
            case '2': 
                intervalInMs = 24 * 60 * 60 * 1000;
                lowerBound = currentTime - intervalInMs;
                break;
            default:
                intervalInMs = 24 * 60 * 60 * 1000;
                lowerBound = currentTime - intervalInMs;
                break;
        }

        return lowerBound
    }

    findSatisfyingIndex(data,selectedIndex) {
        let lowerbound = this.calculateLowerbound(selectedIndex)
        return data.findIndex(x=>parseInt(x.time)>lowerbound)
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
                intervalInMs = 24 * 60 * 60 * 1000;
                lowerBound = currentTime - intervalInMs;
                break;
            default:
                intervalInMs = 24 * 60 * 60 * 1000;
                lowerBound = currentTime - intervalInMs;
                break;
        }

        return data.filter(x=>parseInt(x.time) > lowerBound);
    }

    bin(timeRanges, extractedData) {
        let iterator1 = 0
        let iterator2 = 0
        let objectArray = [];

        while(iterator1 < timeRanges.length && iterator2 < extractedData.length) {
            if (d3.timeMinute(new Date(parseInt(extractedData[iterator2].time))) < timeRanges[iterator1]) {
                iterator2+=1;
            } else {
                objectArray.push({value:extractedData[iterator2-1].value,time:dateFns.format(timeRanges[iterator1],"hh:mm A")});
                iterator1+=1;
            }
        }

        if (iterator2 < extractedData.length) {
            objectArray.push({value:extractedData[extractedData.length-1].value,time:dateFns.format(d3.timeMinute(new Date(parseInt(extractedData[extractedData.length-1].time))),"hh:mm A")});
        }

        while(iterator1 < timeRanges.length && extractedData.length > 0) {
            objectArray.push({value:extractedData[iterator2-1].value,time:dateFns.format(timeRanges[iterator1],"hh:mm A")});
            iterator1+=1;
        }


        //if only one object exists, then that means all votes occured before the bin, that means that we should prepend the value that occured at the very beginning, with its corresponding timestamp
        if (objectArray.length == 1) {
            objectArray.unshift({value:extractedData[0].value,time:dateFns.format(d3.timeMinute(new Date(parseInt(extractedData[0].time))),"hh:mm A")})
        }
        return objectArray
    }

    getData() {
        this.setState({ showLine: false })
        let data = [];
        let lastCount = 0;
        db.collection("locations").doc(this.props.markerAddress).collection('counts')
          .get().then( snapshot => {
            snapshot.forEach( doc => {
              vote = {value:doc.data().count, time:doc.id}
              data.push(vote);
              lastCount = doc.data().count;
            })
            vote = {value:lastCount, time:(Date.now().toString())}
            data.push(vote);
            console.log(data)
            let filtetedData = this.filterDataByInterval(this.state.selectedIndex.toString(),data);
            //no one has voted in past interval then prepend the latest value with time being one interval back
            if (filtetedData.length == 1) {
                filtetedData.unshift({value:filtetedData[0].value,time:(parseInt(filtetedData[0].time)-(1 * 60 * 60 * 1000)).toString()})
            }
            console.log(filtetedData)
            this.processDates(filtetedData)
          })
    }

    processDates(objectArray) {
        // console.log(objectArray)
        let range = d3.timeMinute.range(new Date(parseInt(objectArray[0].time)), new Date(),1);
        // console.log("adasdadasdasd")
        let newObject = this.bin(range,objectArray)
        console.log(range)
        console.log(newObject)

        // for(i = 0; i < objectArray.length;i++) {
        //     let obj = objectArray[i];
        //     // console.log(dateFns.format(d3.timeMinute(new Date(test)),"hh:mm A"))
        //     obj.time = dateFns.format(d3.timeMinute(new Date(parseInt(obj.time))),"hh:mm A"); 
        //     // obj.time = test; 

        //     if (array.length > 0 && obj.time === array[array.length-1].time) {
        //         array[array.length-1] = obj
        //     } else {
        //         array.push(obj)
        //     }
        // }

        // let vote = {value:array[array.length-1].value, time:dateFns.format(d3.timeMinute(new Date()),"hh:mm A")}
        // // let vote = {value:array[array.length-1].value, time:Math.round(new Date()/ coeff) * coeff};
        // array.push(vote);
        // if (objectArray.length === 1) {
        //     let prevote = {value:0, time:objectArray[0].time}
        //     array.unshift(prevote)
        // }
        this.setState({ processedData: newObject},()=>this.setState({ showChart: true, showLine:true }));
        // this.setState({ processedData: newObject},()=>console.log(this.state.processedData));
    }

    componentDidMount() {
        setTimeout(() => {
            this.getData();            
            }, 1000);
    };

    componentWillMount() {};

    render() {    
        const buttons = ['1 hr', '3 hr', '24 hr']
        const { selectedIndex } = this.state
        let string = this.props.leaderboardStatus ? '<': 'X';
        return (
            <View style={[styles.infoPage,this.props.style]}>
                <TouchableOpacity onPress={this.closeInfoPage} style = {styles.closeBar}>
                    <Text style = {{color:'white',fontWeight:'bold'}}>{string}</Text>
                </TouchableOpacity>
                <Text style = {{...styles.locationText, fontSize: 20, fontWeight:'bold'}}>
                        Activity Monitor
                </Text>

                <View>
                    {this.state.showChart && <VictoryChart
                    height={375}
                    width={375}
                    containerComponent={
                        <VictoryVoronoiContainer/>
                      }
                      scale={{ x: "time", y: "linear" }}
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

                        <VictoryAxis 
                        standalone={false}
                        fixLabelOverlap={true}
                        tickValues={[0,1]}
                        // tickFormat={(t) => dateFns.format(t,"hh:mm A")}
                        />

                        <VictoryAxis dependentAxis 
                        standalone={false}
                        tickFormat={(t) => `${Math.round(t*10)/10}`}
                        label="Litness"
                        />
                        
                        
                    </VictoryChart>}
                    <ButtonGroup
                        onPress={this.updateIndex}
                        selectedIndex={selectedIndex}
                        buttons={buttons}
                        containerStyle={{height: 25,backgroundColor:"white",borderColor:"black",width:'60%',alignSelf:'center'}}
                        selectedButtonStyle={{backgroundColor:"black"}}
                        textStyle={{color:"black"}}
                        underlayColor={'black'}
                        innerBorderStyle = {{width:1,color:'black'}}
                        containerBorderRadius={10}
                    />
                </View>
                
                {!this.state.showLine && <View style ={styles.loading}>
                    <ActivityIndicator size="small" color="white" />
                </View>}
                {this.state.showLine && <TouchableOpacity onPress={() => this.getData()} style={styles.refresh}>
                    <Image
                        style = {{flex:1,
                                height: 20,
                                resizeMode: 'contain',
                                width: 20,
                                alignSelf: 'center'}}
                        source={require('./assets/refresh.png')}
                    />
                </TouchableOpacity>}
                <View style ={{display:"flex", flexDirection:"row"}}>
                    <Text style = {{...styles.locationText, fontSize: 20, fontWeight:'bold'}}>
                        Location
                    </Text>
                    <TouchableOpacity onPress={this.goToMarker}>
                        <Image
                            style = {{
                                    margin:2,
                                    height: 30,
                                    resizeMode: 'contain',
                                    width: 30,
                                    }}
                            source={require('./assets/flight.png')}
                        />
                    </TouchableOpacity>
                </View>
                <Text style = {{...styles.locationText, fontSize: 15}}>
                    {this.props.infoPageMarker}
                </Text>
                {this.state.showLine && <View style = {{display:"flex", 
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
                <Button title="Share Location" onPress={() => console.log("Hello")}/>
            </View>
            );
        } 
    }