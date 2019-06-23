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
            showGraph: false,
            originalData: [],
            processedData:[],
            selectedIndex: 0,
        }

        this.updateIndex = this.updateIndex.bind(this)
        this.processDates = this.processDates.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.getData = this.getData.bind(this);
        this.filterDataByInterval = this.filterDataByInterval.bind(this);
        this.wierdShit = this.wierdShit.bind(this);
    }

    updateIndex (selectedIndex) {
        this.setState({selectedIndex})
        this.getData(); 
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

    wierdShit(timeRanges, extractedData) {
        let iterator1 = 0
        let iterator2 = 0
        let objectArray = [];

        while(iterator1 < timeRanges.length && iterator2 < extractedData.length) {
            if (d3.timeMinute(new Date(parseInt(extractedData[iterator2].time))) <= timeRanges[iterator1]) {
                iterator2+=1;
            } else {
                objectArray.push({value:extractedData[iterator2].value,time:dateFns.format(timeRanges[iterator1],"hh:mm A")});
                iterator1+=1;
            }
        }

        if (iterator2 < extractedData.length) {
            console.log("Hello")
            objectArray[objectArray.length-1] = {value:extractedData[extractedData.length-1].value,time:dateFns.format(timeRanges[timeRanges.length-1],"hh:mm A")};
        }

        while(iterator1 < timeRanges.length) {
            objectArray.push({value:extractedData[iterator2-1].value,time:dateFns.format(timeRanges[iterator1],"hh:mm A")});
            iterator1+=1;
        }
        return objectArray
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
            data = this.filterDataByInterval(this.state.selectedIndex.toString(),data);
            this.processDates(data)
          })
    }

    processDates(objectArray) {
        let range = d3.timeMinute.range(new Date(parseInt(objectArray[0].time)), new Date(),5);
        let newObject = this.wierdShit(range,objectArray)

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
        this.setState({ processedData: newObject},()=>this.setState({ showGraph: true }));
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
                <TouchableOpacity onPress={this.props.toggleInfoPage} style = {styles.closeBar}>
                    <Text style = {{color:'white',fontWeight:'bold'}}>{string}</Text>
                </TouchableOpacity>
                <Text style = {{...styles.locationText, fontSize: 20, fontWeight:'bold'}}>
                        Activity Monitor
                </Text>

                <View>
                    <VictoryChart
                    height={375}
                    width={375}
                    containerComponent={
                        <VictoryVoronoiContainer/>
                      }
                      scale={{ x: "time", y: "linear" }}
                    >
                        
                        {this.state.showGraph && <VictoryLine
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
                        tickValues={[0,1,2]}
                        // tickFormat={(t) => dateFns.format(t,"hh:mm A")}
                        />

                        <VictoryAxis dependentAxis 
                        standalone={false}
                        tickFormat={(t) => `${Math.round(t*10)/10}`}
                        label="Litness"
                        />
                        
                        
                    </VictoryChart>
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
                
                {!this.state.showGraph && <View style ={styles.loading}>
                    <ActivityIndicator size="small" color="white" />
                </View>}
                {this.state.showGraph && <TouchableOpacity onPress={() => this.getData()} style={styles.refresh}>
                    <Image
                        style = {{flex:1,
                                height: 20,
                                resizeMode: 'contain',
                                width: 20,
                                alignSelf: 'center'}}
                        source={require('./assets/refresh.png')}
                    />
                </TouchableOpacity>}

                <Text style = {{...styles.locationText, fontSize: 20, fontWeight:'bold'}}>
                    Location
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
                <Button title="Share Location" onPress={() => console.log("Hello")}/>
            </View>
            );
        } 
    }