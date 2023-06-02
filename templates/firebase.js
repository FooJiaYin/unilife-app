
import { firebase } from '../firebase/config';

export async function getItems() {
    let items = []
    let querySnapshot = firebase.firestore().collection('articles')
                        .where("filter", "==", "value")
                        .orderBy("createdTime")
                        .get();
    for (snapshot of querySnapshot) {
        const item = snapshot.data();
        item.id = snapshot.id;
        items.push(item);
    }
    return items;
}

export async function getItem(id) {
    let snapshot = firebase.firestore().doc(`items/${id}`)
    const item = snapshot.data();
    return item;
}