import React from 'react';
import * as FacebookAds from 'expo-ads-facebook';
import {View,Text} from 'react-native';
import styles from './styles.js';
import Dimensions from 'Dimensions';

const { AdTriggerView, AdIconView, AdMediaView, AdOptionsView } = FacebookAds;

class FacebookNativeAd extends React.Component {
    render() {
        return (
            <View style={{...styles.leaderBoardCell, paddingBottom: '1.5%', backgroundColor: '#d3d3d3'}}>
                <View style = {{flexDirection: 'column'}}>
                    <AdMediaView style={{height:1,width:1}}/>
                    <AdOptionsView/>
                    <AdIconView style={styles.emojiIcon} />
                </View>
                <View style = {{display:'flex', flexDirection:'column',paddingHorizontal: Dimensions.get('window').width*0.0242, width: Dimensions.get('window').width*0.546}}>
                    <Text style={{fontSize: Dimensions.get('window').width*0.0242}}>{this.props.nativeAd.sponsoredTranslation}</Text>
                    <Text style={{fontSize: Dimensions.get('window').width*0.0483}}>{this.props.nativeAd.advertiserName}</Text>
                    <Text style={{fontSize: Dimensions.get('window').width*0.029}}>{this.props.nativeAd.bodyText}</Text>
                </View>
                <AdTriggerView style={{
                    ...styles.LBinnerBox,
                    height: Dimensions.get('window').height*0.0408,
                    width: Dimensions.get('window').width*0.193,
                    backgroundColor:"#ffa500",
                }}>
                    <Text style={{fontSize: Dimensions.get('window').width*0.0362}}>{this.props.nativeAd.callToActionText}</Text>
                </AdTriggerView>
            </View>
        );
    }
}

export default FacebookAds.withNativeAd(FacebookNativeAd)