import React from 'react';
import {Image,Text} from 'react-native';
import styles from './styles.js';
import Dimensions from 'Dimensions';

export function renderMarkerIcon(count) { 
    if (count < 0) {
        return <Image
                style = {styles.emojiIcon}
                source={{uri:"https://media.giphy.com/media/WnNzIz5cTKYyVcVZxM/giphy.gif"}}
                />;
    } else if(count < 3) {
        return <Image
                style = {{...styles.emojiIcon}}
                source={require('./assets/logs.png')}
                />;
    } else if (count < 5) {
        return <Image
                style = {styles.emojiIcon}
                source={{uri:"https://media.giphy.com/media/MFyEVDtwt0gaQ0MGmm/giphy.gif"}}
                />;
    } else if (count < 10) {
        return <Image
                style = {{...styles.emojiIcon}}
                source={{uri:"https://media.giphy.com/media/ZBQruf89fJy4hLvrsu/giphy.gif"}}
                />;
    } else {
        return <Image
                style = {{...styles.emojiIcon}}
                source={{uri:"https://media.giphy.com/media/VdiViln8zZB2WdYcmR/giphy.gif"}}
                />;
    } 
}

export function renderGhostIcon() { 
    return  <Image
            style = {styles.emojiIcon}
        //     resizeMode = "cover"
            borderRadius = {Dimensions.get('window').height*.0272}
            source={require('./assets/poo2.png')}
            />
}

export function renderClusterMarker() { 
        return  <Image
                style = {styles.emojiIcon}
            //     resizeMode = "cover"
                borderRadius = {Dimensions.get('window').height*.0272}
                source={require('./assets/town_on_fire.png')}
                />
    }

export function renderLoadingFire() {
    return <Image
            style = {{...styles.emojiIcon,backgroundColor:"white",borderWidth:0, alignSelf:'center'}}
            source={{uri:"https://media.giphy.com/media/MFyEVDtwt0gaQ0MGmm/giphy.gif"}}
            />
}

export function renderRefresh() {
    return <Image
            style = {{flex:1,
                    height: Dimensions.get('window').height*.0204,
                    resizeMode: 'contain',
                    width: Dimensions.get('window').height*.0204,
                    alignSelf: 'center'}}
            source={require('./assets/refresh.png')}
            />
}

export function renderVotingLit() {
    return <Image
            style = {{
                height: Dimensions.get('window').height*.0543,
                resizeMode: 'contain',
                width: Dimensions.get('window').width*.0725,}}
            source={require('./assets/fire.png')}
            />
}

export function renderVotingShit() {
    return <Image
            style = {{
                height: Dimensions.get('window').height*.0543,
                resizeMode: 'contain',
                width: Dimensions.get('window').width*.0725,}}
            source={require('./assets/poop.png')}
            />
}

export function renderNavigationIcon() {
        return <Image
                style = {{
                        height: Dimensions.get('window').height*.0543,
                        resizeMode: 'contain',
                        width: Dimensions.get('window').width*.0725}}
                // this is a place holder. Make sure to find something open source or make our own
                source={require('./assets/navigation.png')}
                />
}

export function renderAddMarkerIcon() {
    return  <Image
            style = {{flex:1,
                    height: (Dimensions.get('window').height*.038),
                    resizeMode: 'contain',
                    width: (Dimensions.get('window').width*.068)}}
            source={require('./assets/insertMarker.png')}
            />
}

export function renderLeaderboardTabIcon() {
    return <Image
            style = {{flex:1,
                    height: (Dimensions.get('window').height*.038),
                    resizeMode: 'contain',
                    width: (Dimensions.get('window').width*.068)}}
            source={require('./assets/medal.png')}
            />
}

export function renderTutorialPageIcon() {
        return <Text
                style = {{flex:1,
                        textAlign: 'center',
                        textAlignVertical: 'center',
                        fontSize: Dimensions.get('window').width*0.0483,
                        height: (Dimensions.get('window').height*.038),
                        resizeMode: 'contain',
                        width: (Dimensions.get('window').width*.068)}}
                >?</Text>
}

export function renderLandmark() {
    return <Image
            style = {{
                    margin:2,
                    height: Dimensions.get('window').height*.0679,
                    resizeMode: 'contain',
                    width: Dimensions.get('window').width*.1208,                                    
                    }}
            source={require('./assets/landmark.png')}
            />
}

export function renderGoogleMaps() {
        return <Image
        style = {{
                margin:2,
                height: Dimensions.get('window').height*.0679,
                resizeMode: 'contain',
                width: Dimensions.get('window').width*.1208,                                    
                }}
        source={require('./assets/google_maps.png')}
        />
}

export function renderUber() {
        return <Image
        style = {{
                margin:2,
                height: Dimensions.get('window').height*.0679,
                resizeMode: 'contain',
                width: Dimensions.get('window').width*.1208,                                    
                }}
        source={require('./assets/uber.png')}
        />
}

export function renderLyft() {
        return <Image
        style = {{
                margin:2,
                height: Dimensions.get('window').height*.0679,
                resizeMode: 'contain',
                width: Dimensions.get('window').width*.1208,                                    
                }}
        source={require('./assets/lyft.png')}
        />
}

export function renderSearch() {
        return <Image
        style = {{
                margin:2,
                height: Dimensions.get('window').height*.0204,
                resizeMode: 'contain',
                width: Dimensions.get('window').height*.0204,                                    
                }}
        source={require('./assets/search.png')}
        />
}

export function renderTarget() {
        return <Image
        style = {{
                margin:2,
                height: Dimensions.get('window').height*.0479,
                resizeMode: 'contain',
                width: Dimensions.get('window').height*.0479,                                    
                }}
        source={require('./assets/target.png')}
        />
}