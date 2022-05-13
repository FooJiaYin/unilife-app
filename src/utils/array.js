export function remove(array, item) {
    var index = array.indexOf(item);
    if (index >= 0) {
        array.splice(index, 1);
    }
    return array;
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