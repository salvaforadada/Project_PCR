'use strict';



const {dialogflow} = require('actions-on-google');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = dialogflow({debug: true});

var config = {
	*******************************
};

admin.initializeApp(config);

const db = admin.firestore();


app.intent('getting_info', (conv, {protocols}) => {
	const collectionRef = db.collection('charly1');
	const term = protocols.toLowerCase();
	const termRef = collectionRef.doc(`${term}`);

	//Ejecutamos la funcion get(), y usamos el snapshot que devuelve como parámetro para crear nuestra función:
	//.then(function(snapshot)) {const...}
	return termRef.get()
	.then((snapshot) => {
		const {title, name, author} = snapshot.data();
		console.log('FUNCIONA:', snapshot.data());
		conv.ask(`Here you go, about ${name}, this is a good paper to start ${title}. ` +
			`The author is ${author}, a very wise man`);
		}).catch((e) => {
			console.log('error:', e);
			conv.ask('Sorry, which transport protocol you were saying.');
		});
	});

	app.intent('subjects', (conv, {subjects}) => {
		const collectionRef = db.collection('subjects');
		const term = subjects.toLowerCase();
		const termRef = collectionRef.doc(`${term}`);
		console.log(`DOCUMENT: ${term}`);

		return termRef.get()
		.then((snapshot) => {
			const {concepts, professors} = snapshot.data();//Think the name of these variables has to be the same than in firebase
			console.log('PROFESORES Y CONCEPTOS:');
			//console.log('FUNCIONA:', snapshot.data());
			//console.log(`PROFESORES:${professors}`);
			conv.ask(`The main concepts of ${subjects} are ${concepts} and the professors are ${professors}. Do you want to know something more?`);
		}).catch((e) => {
			console.log('error:', e);
			conv.ask('Sorry, no such subject');
		});
	});

	app.intent('concepts of subjects', (conv, {subjects, temp_concepts}) => {
		const collectionRef = db.collection('subjects');
		const term = subjects.toLowerCase();
		const termRef = collectionRef.doc(`${term}`);

		return termRef.get()
		.then((snapshot) => {
			const {concepts} = snapshot.data();//Think the name of these variables has to be the same than in firebase
			console.log('CONCEPTOS:');
			//console.log('FUNCIONA:', snapshot.data());
			//console.log(`PROFESORES:${professors}`);
			conv.ask(`The main concepts of ${subjects} are ${concepts}. Do you want to know something more?`);
		}).catch((e) => {
			console.log('error:', e);
			conv.ask('Sorry, no such subject');
		});
	});

	app.intent('professors of subjects', (conv, {subjects, temp_professors}) => {
		const collectionRef = db.collection('subjects');
		const term = subjects.toLowerCase();
		const termRef = collectionRef.doc(`${term}`);

		return termRef.get()
		.then((snapshot) => {
			const {professors} = snapshot.data();//Think the name of these variables has to be the same than in firebase
			console.log('PROFESSORS:');
			//console.log('FUNCIONA:', snapshot.data());
			//console.log(`PROFESORES:${professors}`);
			conv.ask(`The professors of ${subjects} are ${professors}. Do you want to know something more?`);
		}).catch((e) => {
			console.log('error:', e);
			conv.ask('Sorry, no such subject');
		});
	});

	exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
