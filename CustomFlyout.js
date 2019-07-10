import React from 'react';
import {TouchableOpacity,View,Button,Image,Text,ActivityIndicator} from 'react-native';
import styles from './styles.js'
import { VictoryLine, VictoryChart,VictoryLabel, VictoryTooltip,VictoryAxis,VictoryZoomContainer,VictoryVoronoiContainer} from "victory-native";
import * as d3 from 'd3-time';
import dateFns from 'date-fns';
import { ButtonGroup} from 'react-native-elements';
import Svg, { Circle, Rect,G, Triangle, Line } from 'react-native-svg';

export default class CustomFlyout extends React.Component {
    render() {
      const {x, y, orientation} = this.props;
      return (
        <G>
          <Line x1={x} y1={y+500} x2={x} y2={y-500} stroke="lightgrey" strokeWidth=".75"/>   
          <Circle cx={x} cy={y} r="8" stroke="white" fill="black"/>                                                
          <Circle cx={x} cy={y} r="5" stroke="transparent" fill="#007AFF"/>
        </G>
      );
    }
  }