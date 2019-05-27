import React from 'react';
import {TouchableOpacity,View, Image} from 'react-native';
import styles from './styles.js'

export default class LeaderboardTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {};
    componentWillMount() {};

    render() {
        return (
            <View style= {[styles.leaderBoardButton,this.props.style]}>
                <TouchableOpacity onPress={this.props.toggleLeaderBoard}>
                    <Image
                        style = {{flex:1,
                                height: 30,
                                resizeMode: 'contain',
                                width: 30,}}
                        source={require('./assets/medal.png')}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}