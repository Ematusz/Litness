import React from 'react';
import {View,Text,Image, TouchableOpacity} from 'react-native';
import styles from './styles.js'
import { FlatList } from 'react-native-gesture-handler';
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
        data_.push({title: SettingANewHubTitle ,body: SettingANewHubInstructions, key: Math.random().toString()});
        data_.push({renderGif: "https://media.giphy.com/media/LOXJRpvR5bve7xMSgh/giphy.gif", key: Math.random().toString()});
        data_.push({title: VotingOnAnExistingHubTitle, body: VotingOnExistingHubInstructions, key: Math.random().toString()});
        data_.push({renderGif: "https://media.giphy.com/media/WQHYxOqn7j8QHRvjS1/giphy.gif", key: Math.random().toString()});
        data_.push({title: TipsGuidelinesTitle, body: TipsGuidelinesList, key: Math.random().toString()})
        this.setState({data: data_});
    }

    renderTutorialPageCell = ({item}) => {
        if (item.renderGif !== undefined) {
            return(
                <Image style = {{height: Dimensions.get('window').height * .679, resizeMode: 'contain', resizeMethod: 'auto'}}

                    source={{uri: item.renderGif}}
                />
            )
        }
        else {
            return (
                <View>
                    <Text style={{fontSize:Dimensions.get('window').width*0.0411, fontWeight:'bold'}}>{item.title}</Text>
                    <Text style={{fontSize:Dimensions.get('window').width*0.0411}}>{item.body}</Text>
                </View>
            )
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
                <FlatList
                    ItemSeparatorComponent= {this.renderSeparator}
                    data={this.state.data}
                    style={styles.flatListContainer}
                    renderItem={this.renderTutorialPageCell}
                />
            </View>
        );
      }
}