import React, { useState, useCallback, useEffect } from 'react'
import * as rn from 'react-native'
import { styles, Color } from '../styles'
import Asset, { Icon } from './assets'
import { copilot, walkthroughable, CopilotStep } from "react-native-copilot";

export const Text = walkthroughable(rn.Text);
export const TouchableOpacity = walkthroughable(rn.TouchableOpacity);
export const View = walkthroughable(rn.View);
export const AnimatedView = walkthroughable(rn.Animated.View);
export const ScrollView = walkthroughable(rn.ScrollView);
export const Step = CopilotStep;
export const guide = copilot;