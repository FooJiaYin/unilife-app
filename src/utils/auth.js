import React, { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { useFocusEffect } from "@react-navigation/native";

export function checkAuthStatus(user, props) {
    // useFocusEffect(
    //     React.useCallback(() => {
            if (user && user.verification && user.verification.type == "anonymous") {
                Alert.alert('您尚未登入', "請先註冊帳戶，以享有UniLife完整功能。\n如果您已有帳戶，請登入您的帳戶。",
                    [{
                        text: "先試用",
                        onPress: () => props.navigation.navigate('Home'),
                        style: "cancel"
                    }, {
                        text: "註冊/登入",
                        onPress: () => props.navigation.navigate('Login'),
                        style: "OK"
                    }]
                )
                // props.navigation.navigate('Home');
                return false
            } else {
                return true
            }
    //     }, [])
    // )
}