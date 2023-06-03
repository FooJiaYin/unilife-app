export function remove(array, item) {
    var index = array.indexOf(item);
    if (index >= 0) {
        array.splice(index, 1);
    }
    return array;
}

/**
 * Concat obj values into array. Example: 
    ```
    var obj = {a: [1, 2], b: [1, 2]}; 
    var res = concat(obj); // res = [1, 2, 1, 2] 
    ```
 */ 
export function concat(obj) {
    return Object.keys(obj).reduce(function(res, v) {
        return res.concat(obj[v]);
    }, []);
}

export function getUnique(array) {
    return array.filter((item, index) => array.indexOf(item) === index);
}

export function getItemByProperty(array, property, value) {
    return array.find(item => item[property] === value);
}

export function removeItemsByProperty(array, property, value) {
    return array.filter(item => item[property] !== value);
}