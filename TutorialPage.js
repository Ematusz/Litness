import React from 'react';
import {View,Text,Image, TouchableOpacity, FlatList, SectionList} from 'react-native';
import styles from './styles.js'
import { SettingANewHubTitle } from './Text.json';
import { SettingANewHubInstructions } from './Text.json';
import { VotingOnAnExistingHubTitle } from './Text.json';
import { VotingOnExistingHubInstructions } from './Text.json';
import { TipsGuidelinesTitle } from './Text.json';
import { TipsGuidelinesList } from './Text.json';
import Dimensions from 'Dimensions';


export default class TutorialPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
        }
        this.loadTutorialData = this.loadTutorialData.bind(this);
        this.renderTutorialPageCell = this.renderTutorialPageCell.bind(this);
        this.renderSeparator = this.renderSeparator.bind(this);
    }

    componentDidMount() {
        console.log("mounted")
        this.loadTutorialData();
    }

    loadTutorialData() {
        console.log("loaded")
        let data_ = [];
        data_.push({title: SettingANewHubTitle ,data: [SettingANewHubInstructions]});
        data_.push({title: "", data: ["https://media.giphy.com/media/LOXJRpvR5bve7xMSgh/giphy.gif"]});
        data_.push({title: VotingOnAnExistingHubTitle, data: [VotingOnExistingHubInstructions]});
        data_.push({title: "", data: ["https://media.giphy.com/media/Plfa4hA977Dvu41wrG/giphy.gif"]});
        data_.push({title: TipsGuidelinesTitle, data: TipsGuidelinesList});
        this.setState({data: data_});
    }

    renderTutorialPageCell = ({item, index, section, separators}) => {
        if (section.data.length === 1) {
            if (item.includes("https")) {
                return(
                    <Image style = {{height: Dimensions.get('window').height * .679, resizeMode: 'contain'}}
                        source={{uri: item}}
                    />
                )
            } else {
                return (
                    <View>
                        <Text style={{fontSize:Dimensions.get('window').width*0.0411, fontWeight:'bold'}}>{section.title}</Text>
                        <Text style={{fontSize:Dimensions.get('window').width*0.0411}}>{item}</Text>
                    </View>
                ) 
            }
        } else {
            if (index == 0) {
                return (
                    <View>
                        <Text style={{fontSize:Dimensions.get('window').width*0.0411, fontWeight:'bold'}}>{section.title}</Text>
                        <View style={{flexDirection: 'row',width:"95%"}}>
                            <Text style={{fontSize:Dimensions.get('window').width*0.0411,}}>{'\u2022'}  </Text>
                            <Text style={{fontSize:Dimensions.get('window').width*0.0411}}>{item}</Text>
                        </View>
                    </View>
                ) 
            } else {
                return (
                    <View style={{flexDirection: 'row',width:"95%"}}>
                        <Text style={{fontSize:Dimensions.get('window').width*0.0411,}}>{'\u2022'}  </Text>
                        <Text style={{fontSize:Dimensions.get('window').width*0.0411}}>{item}</Text>
                    </View>
                ) 
            }
        }
    }

    renderSeparator = () => {
        return (
          <View
            style={{
              height: 1,
              width: "100%",
              backgroundColor: "#CED0CE",
              alignSelf: "center"
            }}
          />
        );
      };

    render() {
        return (
            <View style = {styles.tutorialPage}>

                <Text style = {{...styles.locationText, fontSize: Dimensions.get('window').width*0.0725, fontWeight:'bold'}}>
                Help
                </Text>
                <TouchableOpacity onPress={this.props.toggleTutorialPage} style = {styles.closeBar}>
                    <Text style = {{color:'white',fontWeight:'bold'}}>X</Text>
                </TouchableOpacity>
                <SectionList
                    SectionSeparatorComponent={({leadingSection}) => leadingSection?this.renderSeparator(leadingSection):null}
                    style={styles.flatListContainer}
                    renderItem={this.renderTutorialPageCell}
                    sections={this.state.data}
                    keyExtractor={(index) => index}
                />
            </View>
        );
      }
}