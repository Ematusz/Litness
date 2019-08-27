import React from 'react';
import {View,Text,TouchableOpacity} from 'react-native';
import styles from './styles.js'
import { FlatList } from 'react-native-gesture-handler';
import { AddHubInstructions } from './Text.json';
import { VoteOnCurrentHub } from './Text.json';


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
        data_.push({text: AddHubInstructions, key: 1})
        data_.push({text: VoteOnCurrentHub, key: 2})
        this.setState({data: data_});
    }

    renderTutorialPageCell = ({item}) => {
        return (
            <Text>{item.text}</Text>
        )
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

                <Text style = {{...styles.locationText, fontSize: 30, fontWeight:'bold'}}>
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