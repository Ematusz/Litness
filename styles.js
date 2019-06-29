import { StyleSheet } from 'react-native';
export default StyleSheet.create({
    container: {
        justifyContent: 'center',
        flex:1
      },
    infoPage: {
        height: '90%',
        width: '90%',
        position: 'absolute',
        top:50,
        alignSelf:'center',
        borderColor:'black',
        borderWidth: 2,
        borderRadius: 15,
        backgroundColor: 'white',
        flex:1,
        flexDirection:'column',
        justifyContent:'flex-start',
        alignItems:'center',
        zIndex:4,
      },
      leaderboard: {
        height: '90%',
        width: '90%',
        position: 'absolute',
        top:50,
        alignSelf:'center',
        borderColor:'black',
        borderWidth: 2,
        borderRadius: 15,
        backgroundColor: 'white',
        flex:1,
        flexDirection:'column',
        justifyContent:'flex-start',
        alignItems:'center',
        zIndex:1,
      },
    animView: {
        backgroundColor:'blue',
        flex:.5,
        borderBottomColor:'black',
        borderBottomWidth: 5,
      },
    bigContainer: {
        flex:1,
        flexDirection: 'column',
        justifyContent:'flex-start',
      },
    locationText: {
        marginTop:10,
        alignSelf: 'center',
      },
    marker: {
        // padding: 5,
        borderRadius: 30,
        borderWidth: 2,
        // backgroundColor:"red",
        borderColor: "transparent",
        position: 'absolute',
        alignItems:'center',
        justifyContent:'center',
        // flexDirection:"column",
        // justifyContent: "center",
      },
      markerHeatMap: {
        // padding: 5,
        borderRadius: 30,
        height: 60,
        width: 60,
        // backgroundColor:"red",
        borderColor: "transparent",
        position: 'absolute',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'rgba(255,0,0,.3)',
      },
    tabStyle: {
        borderRadius: 5,
        borderWidth: 2,
        // backgroundColor:"red",
        borderColor: "transparent",
        position: 'absolute',
        alignItems:'center',
        justifyContent:'center',
        fontSize: 50,
      },
    ghostMarker: {
        borderRadius: 30,
        borderWidth: 2,
        borderColor: "transparent",
        backgroundColor:"white",
        position: 'absolute',
        alignItems:'center',
        justifyContent:'center',
      },
    test: {
        flex:1,
        flexDirection:'row',
        justifyContent: 'space-evenly',
        width: 100,
        height: 40,
        alignItems: 'center',
        backgroundColor:"white",
        borderColor:'black',
        borderWidth: 2,
        borderRadius: 10
      },
    text: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 20
      },
    
    testtext: {
        color: "black",
        fontWeight: "bold",
        fontSize: 16,
        position: 'absolute',
        // top:'40%'
      },
    
    tab: {
        backgroundColor:"white",
        borderColor:'black',
        borderWidth: 2,
        borderRadius: 10,
        position: 'absolute',
        flex:1,
        // left: '95%',
        top: '40%',
        flexDirection:'column',
        justifyContent: 'space-evenly',
        alignItems:"center",
      },
    
    leaderBoardButton: {
        backgroundColor:"white",
        borderColor:'black',
        borderWidth: 2,
        position: 'absolute',
        flex:1,
        right: 0,
        top: '10%',
      },
    
    leaderBoardCell: {
        marginTop: 10,
        display:"flex",
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderBottomWidth: 0,
        // borderRadius: 15,
        backgroundColor:'white'
      },
    
    flatListContainer: {
        flex: 1,
        width: '95%',
      },
    LBinnerBox: {
        height:30,
        width: 30,
        flexDirection:'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right:4,
        backgroundColor:"white",
      },
    leaderboardText: {
        fontSize: 20,
      },
    closeBar: {
        backgroundColor: 'red',
        justifyContent:'center',
        alignItems:'center',
        width: 30,
        height: 30,
        borderRadius: 30,
        position: 'absolute',
        left: 4,
        top: 4
      },
    emojiIcon: {
      height: 40,
      resizeMode: 'contain',
      width: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: 'black',
      backgroundColor:'whitesmoke'
    },
    emojiIconHeatMap: {
      height: 40,
      resizeMode: 'contain',
      width: 40,
      borderRadius: 20,
      backgroundColor:'transparent'
    },
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f5fcff"
    },
    refresh: {
      position: 'absolute',
      right: 2,
      top:2,
      backgroundColor: '#007AFF',
      borderRadius: 50,
      width: 30,
      height: 30,
      justifyContent:'center'
    },
    infoPageIcons: {
      height: 20,
      resizeMode: 'contain',
      width: 20,
      backgroundColor:'white'
    },
    loading: {
      position: 'absolute',
      right: 2,
      top:2,
      backgroundColor: '#007AFF',
      borderRadius: 50,
      width: 30,
      height: 30,
      justifyContent:'center'
    }, 
    flight: {
      width: 30,
      height: 30,
      justifyContent:'center'
    }

});