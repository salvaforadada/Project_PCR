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

	/*app.intent('subjects', (conv, {subjects}) => {
	const collectionRef = db.collection('subjects');
	const term = subjects.toLowerCase();
	const termRef = collectionRef.doc(`${term}`);
	console.log(`DOCUMENT: ${term}`);
	//const documents = [];
	//const subject = subjects;

	return termRef.get()
	.then((snapshot) => {
	const {concepts, professors} = snapshot.data();//Think the name of these variables has to be the same than in firebase
	console.log('FUNCIONA:', snapshot.data());
	console.log(`PROFESORES:${professors}`);
	conv.ask(`The main concepts of ${subjects} are ${concepts} and the professors are ${professors}. Do you want to know something more?`);
}).catch((e) => {
console.log('error:', e);
conv.ask('Sorry, no such subject');
});
});
*/
app.intent('subjects', (conv, {subjects, temp_professors, temp_concepts}) => {
	const collectionRef = db.collection('subjects');
	const term = subjects.toLowerCase();
	const termRef = collectionRef.doc(`${term}`);

	if ((temp_professors == undefined) && (temp_concepts == undefined) ) { //Solo ha dado el nombre de la asig --> devolvemos conceptos y profesores
		console.log(`PROFESSORS AND CONCEPTS UNDEFINED`);

		return termRef.get()
		.then((snapshot) => {
			const {concepts, professors} = snapshot.data();//Think the name of these variables has to be the same as in firebase
			//console.log('FUNCIONA:', snapshot.data());
			console.log(`DENTRO --> PROFESSORS AND CONCEPTS UNDEFINED`);
			conv.ask(`The main concepts of ${subjects} are ${concepts} and the professors are ${professors}. Do you want to know something more?`);
		}).catch((e) => {
			console.log('error:', e);
			conv.ask('Sorry, no such subject');
		});

	} else if (temp_professors == undefined) { //En este caso, lo que pide el usuario sera los conceptos de una asignatura
		console.log(`PROFESSORS UNDEFINED AND CONCEPTS DEFINED`);

		return termRef.get()
		.then((snapshot) => {
			const {concepts} = snapshot.data();//Think the name of these variables has to be the same than in firebase
			//console.log('FUNCIONA:', snapshot.data());
			console.log(`DENTRO: PROFESSORS UNDEFINED AND CONCEPTS DEFINED`);
			conv.ask(`The main concepts of ${subjects} are ${concepts}. Do you want to know something more?`);
		}).catch((e) => {
			console.log('error:', e);
			conv.ask('Sorry, no such subject');
		});

	} else { //si ha llegado hasta aqui es que el que no esta definido es el temp_concepts, o sea que el usuario pide los profesores de una asignatura
		console.log(`PROFESSORS DEFINED AND CONCEPTS UNDEFINED`);

		return termRef.get()
		.then((snapshot) => {
			const {professors} = snapshot.data();//Think the name of these variables has to be the same than in firebase
			//console.log('FUNCIONA:', snapshot.data());
			console.log(`DENTRO: PROFESSORS DEFINED AND CONCEPTS UNDEFINED`);
			conv.ask(`The professors of ${subjects} are ${professors}. Do you want to know something more?`);
		}).catch((e) => {
			console.log('error:', e);
			conv.ask('Sorry, no such subject');
		});
	}
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
