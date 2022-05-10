import React, { useState } from 'react';
import { Components } from 'react-native';
// import other packages
// import other Components from "../components/..."
// import utils
import { getUser } from '../firebase/users';
import { getItem } from '../firebase/items';
import { styles, Color } from '../styles';

export function MyComponent({requiredProp1, requiredProp2, props }) {
    // List local states
    const [state, setState] = useState();
    const [items, setItem] = useState({  // Replace 'items' with collection name
        // all props
    });

    const itemStyle = {
        
    };

    // if more then 2 style
    const itemStyle = StyleSheet.create({
        
    });

    async function loadItem() {
        let item = getItem(item.id);
        // do something
        setItem(item)
    };

    useEffect(() => {
        loadItem();
    }, []);

    function sendData() {
        // something to to on event
    }

    // event handlers
    const handleEvent = () => {
        setState(true);
        sendData();
        onEvent(); // call onEvent() from parent
    };

    return (
        <View style={itemStyle}>
            <View onEvent={handleEvent}></View>
        </View>
    )
}



    